package models

// UserRole represents the role of a user in the system
type UserRole string

const (
	RoleUser  UserRole = "user"
	RoleAdmin UserRole = "admin"
)

// IsValid checks if the role is valid
func (r UserRole) IsValid() bool {
	switch r {
	case RoleUser, RoleAdmin:
		return true
	}
	return false
}

// String returns the string representation of the role
func (r UserRole) String() string {
	return string(r)
}

func (r UserRole) IsAdmin() bool {
	return r == RoleAdmin
}
