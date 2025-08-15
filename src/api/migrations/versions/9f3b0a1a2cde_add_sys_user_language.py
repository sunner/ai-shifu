"""add sys_user_language and copy from user_info.user_language

Revision ID: 9f3b0a1a2cde
Revises: 2681575163c0
Create Date: 2025-08-08 10:20:00

"""

from alembic import op
from sqlalchemy.sql import text

# revision identifiers, used by Alembic.
revision = "9f3b0a1a2cde"
down_revision = "2681575163c0"
branch_labels = None
depends_on = None


def upgrade():
        connection = op.get_bind()
        # Copy per-user interface language from user_info into user_profile as sys_user_language (system scope, profile_id = "")
        # Do not overwrite if the sys_user_language already exists for that user.
        connection.execute(
                text(
                        """
                        INSERT INTO user_profile (user_id, profile_key, profile_value, profile_type, profile_id)
                        SELECT u.user_id, 'sys_user_language', u.user_language, 2901, ''
                        FROM user_info u
                        LEFT JOIN user_profile up
                            ON up.user_id = u.user_id
                         AND up.profile_key = 'sys_user_language'
                         AND up.profile_id = ''
                        WHERE COALESCE(u.user_language, '') <> ''
                            AND up.id IS NULL;
                        """
                )
        )


def downgrade():
        # No-op: avoid deleting sys_user_language to prevent data loss on rollback.
        pass
