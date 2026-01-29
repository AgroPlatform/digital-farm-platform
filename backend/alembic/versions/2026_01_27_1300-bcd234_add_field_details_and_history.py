"""add field details and history

Revision ID: bcd234
Revises: abc123
Create Date: 2026-01-27 13:00:00.000000

"""
from typing import Sequence, Union


# revision identifiers, used by Alembic.
revision: str = "bcd234"
down_revision: Union[str, None] = "abc123"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
	"""No-op placeholder for legacy migration.

	The schema changes for field details were applied out-of-band.
	Keeping this revision ensures a linear Alembic history.
	"""


def downgrade() -> None:
	"""No-op downgrade for legacy migration."""
