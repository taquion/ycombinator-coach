import os
import jwt
import requests
import logging
import azure.functions as func
from functools import wraps

# --- Configuration --- 
TENANT_NAME = os.environ.get("B2C_TENANT_NAME")
USER_FLOW = os.environ.get("B2C_USER_FLOW", "B2C_1_susi_1") # Default user flow
CLIENT_ID = os.environ.get("B2C_CLIENT_ID")

# Construct the metadata URL for OpenID Connect discovery
METADATA_URL = f"https://{TENANT_NAME}.ciamlogin.com/{TENANT_NAME}.onmicrosoft.com/{USER_FLOW}/v2.0/.well-known/openid-configuration"

# --- JWKS (JSON Web Key Set) Caching --- 
jwks_cache = {}

def get_jwks():
    """Fetches and caches the JWKS from the metadata URL."""
    global jwks_cache
    if jwks_cache:
        return jwks_cache
    try:
        response = requests.get(METADATA_URL)
        response.raise_for_status()
        metadata = response.json()
        jwks_uri = metadata['jwks_uri']
        
        jwks_response = requests.get(jwks_uri)
        jwks_response.raise_for_status()
        jwks_cache = jwks_response.json()
        return jwks_cache
    except requests.RequestException as e:
        logging.error(f"Failed to fetch JWKS: {e}")
        return None

# --- Decorator Definition --- 
def require_auth(func_to_decorate):
    """
    Authentication decorator for Azure Functions.
    Validates a Bearer token from the Authorization header.
    If valid, injects the decoded token claims into the request object.
    """
    @wraps(func_to_decorate)
    def wrapper(req: func.HttpRequest, *args, **kwargs):
        auth_header = req.headers.get('Authorization')

        if not auth_header or not auth_header.startswith('Bearer '):
            return func.HttpResponse(
                "Authorization header is missing or invalid.", status_code=401
            )

        token = auth_header.split(' ')[1]
        jwks = get_jwks()
        if not jwks:
            return func.HttpResponse("Could not retrieve security keys.", status_code=500)

        try:
            # Get the correct key for this token
            unverified_header = jwt.get_unverified_header(token)
            rsa_key = {}
            for key in jwks['keys']:
                if key['kid'] == unverified_header['kid']:
                    rsa_key = {
                        'kty': key['kty'],
                        'kid': key['kid'],
                        'use': key['use'],
                        'n': key['n'],
                        'e': key['e']
                    }
                    break
            
            if not rsa_key:
                raise jwt.exceptions.InvalidKeyError("Public key not found in JWKS.")

            # Decode and validate the token
            decoded_token = jwt.decode(
                token,
                rsa_key,
                algorithms=["RS256"],
                audience=CLIENT_ID, # The application's client ID
                issuer=f"https://{TENANT_NAME}.ciamlogin.com/{os.environ['B2C_TENANT_ID']}/v2.0/" # Must match the 'iss' claim
            )

            # Inject claims into the request for the function to use
            req.token_claims = decoded_token

            # Call the original function
            return func_to_decorate(req, *args, **kwargs)

        except jwt.ExpiredSignatureError:
            logging.warning("Token has expired.")
            return func.HttpResponse("Token has expired.", status_code=401)
        except jwt.InvalidAudienceError:
            logging.warning("Invalid token audience.")
            return func.HttpResponse("Invalid token audience.", status_code=401)
        except jwt.exceptions.PyJWTError as e:
            logging.error(f"Token validation error: {e}")
            return func.HttpResponse(f"Invalid token: {e}", status_code=401)
        except Exception as e:
            logging.error(f"An unexpected error occurred during authentication: {e}")
            return func.HttpResponse("An internal error occurred during authentication.", status_code=500)

    return wrapper
