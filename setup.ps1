# Create virtual environment if it doesn't exist
if (-not (Test-Path -Path ".venv")) {
    Write-Host "Creating Python virtual environment..."
    python -m venv .venv
}

# Activate the virtual environment
$activateScript = ".\.venv\Scripts\Activate.ps1"
if (Test-Path $activateScript) {
    Write-Host "Activating virtual environment..."
    . $activateScript
    
    # Install requirements
    Write-Host "Installing Python dependencies..."
    pip install -r backend/requirements.txt
    
    Write-Host "✅ Setup complete! Virtual environment is ready to use."
    Write-Host "To activate the virtual environment in the future, run:"
    Write-Host "    .\.venv\Scripts\Activate.ps1"
} else {
    Write-Error "Failed to find virtual environment activation script."
}
