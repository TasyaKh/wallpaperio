package auth

import (
	"context"
	"encoding/json"
	"fmt"

	"wallpaperio/server/internal/config"
	constants "wallpaperio/server/internal/config/constants"

	"wallpaperio/server/internal/domain"

	"golang.org/x/oauth2"
	"golang.org/x/oauth2/google"
)

type GoogleAuth struct {
	config *oauth2.Config
}

func NewGoogleAuth(cfg *config.GoogleConfig) *GoogleAuth {
	config := &oauth2.Config{
		ClientID:     cfg.ClientID,
		ClientSecret: cfg.ClientSecret,
		RedirectURL:  cfg.RedirectURL,
		Scopes:       constants.GoogleAuthScopes,
		Endpoint:     google.Endpoint,
	}

	return &GoogleAuth{config: config}
}

func (g *GoogleAuth) GetAuthURL() string {
	return g.config.AuthCodeURL("state-token", oauth2.AccessTypeOffline)
}

func (g *GoogleAuth) GetUserInfo(code string) (*domain.GoogleUserInfo, error) {
	token, err := g.config.Exchange(context.Background(), code)
	if err != nil {
		return nil, fmt.Errorf("code exchange failed: %v", err)
	}

	client := g.config.Client(context.Background(), token)
	resp, err := client.Get(constants.GoogleUserInfoEndpoint)
	if err != nil {
		return nil, fmt.Errorf("failed getting user info: %v", err)
	}
	defer resp.Body.Close()

	var userInfo domain.GoogleUserInfo
	if err := json.NewDecoder(resp.Body).Decode(&userInfo); err != nil {
		return nil, fmt.Errorf("failed to decode user info: %v", err)
	}

	return &userInfo, nil
}
