package domain

import "github.com/golang-jwt/jwt/v5"

type CallbackGoogleRequest struct {
	Code  string `json:"code"`
	State string `json:"state"`
}

type Claims struct {
	UserID uint   `json:"user_id"`
	Email  string `json:"email"`
	jwt.RegisteredClaims
}
