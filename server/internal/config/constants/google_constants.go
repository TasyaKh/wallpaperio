package config

const (
	GoogleOAuthBaseURL = "https://www.googleapis.com"

	// Endpoints for Google OAuth
	GoogleUserInfoEndpoint = GoogleOAuthBaseURL + "/oauth2/v2/userinfo"
)

// GoogleAuthScopes contains all required OAuth scopes
var GoogleAuthScopes = []string{
	GoogleOAuthBaseURL + "/auth/userinfo.email",
	GoogleOAuthBaseURL + "/auth/userinfo.profile",
}
