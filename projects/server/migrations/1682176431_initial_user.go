package migrations

import (
	"github.com/pocketbase/dbx"
	"github.com/pocketbase/pocketbase/daos"
	m "github.com/pocketbase/pocketbase/migrations"
	"github.com/pocketbase/pocketbase/models"
)

func init() {
	m.Register(func(db dbx.Builder) error {
		dao := daos.New(db)
		collection, err := dao.FindCollectionByNameOrId("users")
		if err != nil {
			return err
		}

		record := models.NewRecord(collection)
		record.Set("username", "demo")
		record.Set("email", "demo@domain.tld")
		record.Set("name", "Demo User")
		record.Set("emailVisibility", true)
		record.Set("passwordHash", generatePassword("demo"))
		err = record.SetVerified(true)
		if err != nil {
			return err
		}

		if err := dao.SaveRecord(record); err != nil {
			return err
		}

		err = daos.New(db).RunInTransaction(func(txDao *daos.Dao) error {

			query := txDao.DB().Insert("_admins", map[string]interface{}{
				"id":           "admin",
				"email":        "admin@domain.tld",
				"passwordHash": generatePassword("demo"),
				"tokenKey":     "test",
			})
			if _, err := query.Execute(); err != nil {
				return err
			}

			return nil
		})
		if err != nil {
			return err
		}

		return nil
	}, func(db dbx.Builder) error {

		return nil
	})
}
func generatePassword(password string) string {
	admin := models.Admin{}
	err := admin.SetPassword(password)
	if err != nil {
		return err.Error()
	}
	return admin.PasswordHash
}
