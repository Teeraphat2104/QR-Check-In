package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type Activity struct {
	ID                   uuid.UUID `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	Title                string    `gorm:"not null" json:"title"`
	Description          string    `gorm:"type:text" json:"description"`
	Date                 time.Time `gorm:"not null" json:"date"`
	Location             string    `json:"location"`
	Category             string    `json:"category"`
	CoverImageURL        string    `json:"cover_image_url"`
	CheckInToken         string    `gorm:"uniqueIndex" json:"check_in_token,omitempty"`
	CheckInTokenExpiresAt *time.Time `json:"check_in_token_expires_at,omitempty"`
	CreatedAt            time.Time `gorm:"autoCreateTime" json:"created_at"`
	UpdatedAt            time.Time `gorm:"autoUpdateTime" json:"updated_at"`

	Participants []ActivityParticipant `gorm:"foreignKey:ActivityID" json:"participants,omitempty"`
}

func (a *Activity) BeforeCreate(tx *gorm.DB) error {
	if a.ID == uuid.Nil {
		a.ID = uuid.New()
	}
	return nil
}
