# Msal testing project

This app is meant to test if the msal loadTokensExternal function is still working. 

# Prerequisites
## App Registration and Client ID

To set up app registration and client ID, follow these steps:

1. **Register the application in Azure AD**:
    - Go to the Azure portal.
    - Navigate to "Azure Active Directory" > "App registrations" > "New registration".
    - Enter a name for the application.
    - Set the redirect URI to `https://localhost:3000` for local development and `https://deployedURL` for production.
    - Click "Register".

2. **Configure API permissions**:
    - After registration, go to "API permissions".
    - Click "Add a permission" and select the required APIs and permissions.
    - Click "Grant admin consent" to grant the permissions.

3. **Create a client secret**:
    - Go to "Certificates & secrets".
    - Click "New client secret" and add a description.
    - Set the expiration period and click "Add".
    - Copy the client secret value and store it securely.

4. **Update the `config.ts` file**:
    - Replace the placeholders in the `config.ts` file with the actual values from the Azure portal.
    - Update `clientId`, `tenantId`, `redirectUri`, and other relevant fields.


By following these steps, you will have successfully registered your application and configured the client ID in your project.

## Certificates

To get certificates, you have the following commands.

1. install chocolatey
2. then, the actual certificate library, 'choco install mkcert' `do this from admin`
3. run `mkcert -install` to install the root certificate
4. now run the following to create the actual certificates.



Run these commands from the `MSAL-TEST-PROJ` folder.
```bash
//creates a certificate folder
mkdir -p .cert
//creates the actual certificates in the folder 
mkcert -key-file ./.cert/key.pem -cert-file ./.cert/cert.pem "localhost"

```
a new .cert folder should be next to the .vscode folder under the `MSAL-TEST-PROJ` folder.