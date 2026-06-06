package models

import (
	"time"

	"github.com/google/uuid"
	"gorm.io/gorm"
)

type ActivityParticipant struct {
	ID          uuid.UUID  `gorm:"type:uuid;primaryKey;default:gen_random_uuid()" json:"id"`
	ActivityID  uuid.UUID  `gorm:"type:uuid;not null;index" json:"activity_id"`
	StudentID   uuid.UUID  `gorm:"type:uuid;not null;index" json:"student_id"`
	Name        string     `gorm:"not null" json:"name"`
	Faculty     string     `json:"faculty"`
	ExtraData   string     `gorm:"type:jsonb" json:"extra_data,omitempty"`
	CheckedInAt *time.Time `json:"checked_in_at,omitempty"`
	CreatedAt   time.Time  `gorm:"autoCreateTime" json:"created_at"`

	Activity *Activity `gorm:"foreignKey:ActivityID" json:"activity,omitempty"`
	Student  *Student  `gorm:"foreignKey:StudentID" json:"student,omitempty"`
}

func (ap *ActivityParticipant) BeforeCreate(tx *gorm.DB) error {
	if ap.ID == uuid.Nil {
		ap.ID = uuid.New()
	}
	return nil
}
