"""alter active 

Revision ID: 418eeb59384d
Revises: 72e53bce45e5
Create Date: 2024-08-18 11:24:28.302282

"""
from alembic import op
import sqlalchemy as sa
from sqlalchemy.dialects import mysql

# revision identifiers, used by Alembic.
revision = '418eeb59384d'
down_revision = '72e53bce45e5'
branch_labels = None
depends_on = None


def upgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('active', schema=None) as batch_op:
        batch_op.alter_column('active_start_time',
               existing_type=mysql.TIMESTAMP(),
               type_=sa.DateTime(),
               existing_comment='Active start time',
               existing_nullable=False,
               existing_server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))
        batch_op.alter_column('active_end_time',
               existing_type=mysql.TIMESTAMP(),
               type_=sa.DateTime(),
               existing_comment='Active end time',
               existing_nullable=False,
               existing_server_default=sa.text("'0000-00-00 00:00:00'"))

    # ### end Alembic commands ###


def downgrade():
    # ### commands auto generated by Alembic - please adjust! ###
    with op.batch_alter_table('active', schema=None) as batch_op:
        batch_op.alter_column('active_end_time',
               existing_type=sa.DateTime(),
               type_=mysql.TIMESTAMP(),
               existing_comment='Active end time',
               existing_nullable=False,
               existing_server_default=sa.text("'0000-00-00 00:00:00'"))
        batch_op.alter_column('active_start_time',
               existing_type=sa.DateTime(),
               type_=mysql.TIMESTAMP(),
               existing_comment='Active start time',
               existing_nullable=False,
               existing_server_default=sa.text('CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP'))

    # ### end Alembic commands ###
