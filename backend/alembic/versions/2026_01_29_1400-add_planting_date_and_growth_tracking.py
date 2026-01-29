"""Add planting_date and growth_tracking to fields table.

Revision ID: add_growth_tracking_001
Revises: 
Create Date: 2026-01-29 14:00:00.000000

"""
from alembic import op
import sqlalchemy as sa
from datetime import datetime


# revision identifiers, used by Alembic.
revision = 'add_growth_tracking_001'
down_revision = 'bcd234'
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Add planting_date column to fields table
    op.add_column('fields', sa.Column('planting_date', sa.Date(), nullable=True))
    
    # Add growth_days column (duration in days for the current crop)
    op.add_column('fields', sa.Column('growth_days', sa.Integer(), nullable=True, server_default='0'))


def downgrade() -> None:
    op.drop_column('fields', 'growth_days')
    op.drop_column('fields', 'planting_date')
