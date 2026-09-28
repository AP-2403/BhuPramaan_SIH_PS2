"""Initial migration: create all tables with PostGIS extensions.

Revision ID: 0001_initial
Revises: 
Create Date: 2026-09-28
"""
from __future__ import annotations

import sqlalchemy as sa
from alembic import op
from sqlalchemy.dialects import postgresql
from geoalchemy2 import Geometry

revision = "0001_initial"
down_revision = None
branch_labels = None
depends_on = None


def upgrade() -> None:
    # Enable extensions
    op.execute("CREATE EXTENSION IF NOT EXISTS postgis")
    op.execute("CREATE EXTENSION IF NOT EXISTS pg_trgm")
    op.execute("CREATE EXTENSION IF NOT EXISTS \"uuid-ossp\"")

    # users
    op.create_table(
        "users",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("username", sa.String(64), nullable=False),
        sa.Column("password_hash", sa.String(256), nullable=False),
        sa.Column("full_name", sa.String(256)),
        sa.Column("role", sa.String(32), nullable=False),
        sa.Column("state_code", sa.String(8)),
        sa.Column("district_code", sa.String(8)),
        sa.Column("tehsil_code", sa.String(8)),
        sa.Column("is_active", sa.Boolean, nullable=False, server_default="true"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_users_username", "users", ["username"], unique=True)

    # documents
    op.create_table(
        "documents",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("batch_id", sa.String(36)),
        sa.Column("filename", sa.String(512), nullable=False),
        sa.Column("mime", sa.String(128)),
        sa.Column("storage_key", sa.String(512)),
        sa.Column("pages", sa.Integer, server_default="1"),
        sa.Column("doc_type", sa.String(64)),
        sa.Column("script", sa.String(32)),
        sa.Column("state_code", sa.String(8)),
        sa.Column("district_code", sa.String(8)),
        sa.Column("tehsil_code", sa.String(8)),
        sa.Column("village_code", sa.String(16)),
        sa.Column("status", sa.String(32), nullable=False, server_default="uploaded"),
        sa.Column("quality_score", sa.Float),
        sa.Column("uploaded_by", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("uploaded_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("processed_at", sa.DateTime(timezone=True)),
        sa.Column("is_seed", sa.Boolean, nullable=False, server_default="false"),
        sa.Column("sha256", sa.String(64)),
    )
    op.create_index("ix_documents_status", "documents", ["status"])
    op.create_index("ix_documents_sha256", "documents", ["sha256"])
    op.create_index("ix_documents_batch_id", "documents", ["batch_id"])

    # pages
    op.create_table(
        "pages",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("page_no", sa.Integer, nullable=False),
        sa.Column("original_key", sa.String(512)),
        sa.Column("restored_key", sa.String(512)),
        sa.Column("quality_score", sa.Float),
        sa.Column("width", sa.Integer),
        sa.Column("height", sa.Integer),
        sa.Column("rotation_deg", sa.Float),
        sa.Column("layout_json", postgresql.JSONB),
        sa.Column("ocr_json", postgresql.JSONB),
    )
    op.create_index("ix_pages_document_id", "pages", ["document_id"])

    # extractions
    op.create_table(
        "extractions",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("version", sa.Integer, server_default="1"),
        sa.Column("status", sa.String(32), server_default="pending"),
        sa.Column("overall_confidence", sa.Float),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("data", postgresql.JSONB),
    )
    op.create_index("ix_extractions_document_id", "extractions", ["document_id"])

    # fields
    op.create_table(
        "fields",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("extraction_id", sa.String(36), sa.ForeignKey("extractions.id"), nullable=False),
        sa.Column("path", sa.String(256), nullable=False),
        sa.Column("raw_value", sa.Text),
        sa.Column("value", sa.Text),
        sa.Column("normalized", postgresql.JSONB),
        sa.Column("confidence", sa.Float),
        sa.Column("page_no", sa.Integer),
        sa.Column("bbox", postgresql.JSONB),
        sa.Column("engine_votes", postgresql.JSONB),
        sa.Column("status", sa.String(32), server_default="ok"),
        sa.Column("validation", postgresql.JSONB),
    )
    op.create_index("ix_fields_extraction_id", "fields", ["extraction_id"])

    # validation_results
    op.create_table(
        "validation_results",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("extraction_id", sa.String(36), sa.ForeignKey("extractions.id"), nullable=False),
        sa.Column("rule_id", sa.String(8), nullable=False),
        sa.Column("severity", sa.String(16)),
        sa.Column("passed", sa.Boolean, nullable=False),
        sa.Column("message", sa.Text),
        sa.Column("field_paths", postgresql.ARRAY(sa.String)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.create_index("ix_valres_extraction_id", "validation_results", ["extraction_id"])

    # review_tasks
    op.create_table(
        "review_tasks",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("extraction_id", sa.String(36), sa.ForeignKey("extractions.id"), nullable=False),
        sa.Column("priority", sa.Float, server_default="0.5"),
        sa.Column("reason", sa.Text),
        sa.Column("assigned_to", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("status", sa.String(32), server_default="open"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("completed_at", sa.DateTime(timezone=True)),
    )
    op.create_index("ix_review_tasks_status", "review_tasks", ["status"])

    # corrections
    op.create_table(
        "corrections",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("field_id", sa.String(36), sa.ForeignKey("fields.id"), nullable=False),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id"), nullable=False),
        sa.Column("before_value", sa.Text),
        sa.Column("after_value", sa.Text),
        sa.Column("error_type", sa.String(64)),
        sa.Column("engine_votes", postgresql.JSONB),
        sa.Column("doc_type", sa.String(64)),
        sa.Column("script", sa.String(32)),
        sa.Column("quality_level", sa.String(16)),
        sa.Column("corrected_by", sa.String(36), sa.ForeignKey("users.id")),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.Column("used_in_training", sa.Boolean, server_default="false"),
    )

    # persons
    op.create_table(
        "persons",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("name_norm", sa.String(256), nullable=False),
        sa.Column("name_hi", sa.String(256)),
        sa.Column("name_en", sa.String(256)),
        sa.Column("relative_name", sa.String(256)),
        sa.Column("village_code", sa.String(16)),
    )
    op.create_index("ix_persons_name_norm", "persons", ["name_norm"])

    # ownership_edges
    op.create_table(
        "ownership_edges",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("from_person", sa.String(36), sa.ForeignKey("persons.id")),
        sa.Column("to_person", sa.String(36), sa.ForeignKey("persons.id"), nullable=False),
        sa.Column("khasra_no", sa.String(64), nullable=False),
        sa.Column("village_code", sa.String(16), nullable=False),
        sa.Column("area_sq_m", sa.Float),
        sa.Column("share", sa.Float),
        sa.Column("event_type", sa.String(32)),
        sa.Column("mutation_no", sa.String(64)),
        sa.Column("event_date", sa.Date),
        sa.Column("source_document_id", sa.String(36), sa.ForeignKey("documents.id")),
    )

    # parcels
    op.create_table(
        "parcels",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("village_code", sa.String(16), nullable=False),
        sa.Column("khasra_no", sa.String(64), nullable=False),
        sa.Column("geom", Geometry("MULTIPOLYGON", srid=4326)),
        sa.Column("area_sq_m", sa.Float),
        sa.Column("source", sa.String(64)),
        sa.Column("map_document_id", sa.String(36), sa.ForeignKey("documents.id")),
        sa.UniqueConstraint("village_code", "khasra_no", name="uq_parcel_village_khasra"),
    )
    op.execute("CREATE INDEX ix_parcels_geom ON parcels USING GIST(geom)")

    # land_records
    op.create_table(
        "land_records",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("document_id", sa.String(36), sa.ForeignKey("documents.id")),
        sa.Column("extraction_id", sa.String(36), sa.ForeignKey("extractions.id")),
        sa.Column("state_code", sa.String(8)),
        sa.Column("district_code", sa.String(8)),
        sa.Column("tehsil_code", sa.String(8)),
        sa.Column("village_code", sa.String(16)),
        sa.Column("khata_no", sa.String(64)),
        sa.Column("khasra_no", sa.String(64)),
        sa.Column("area_sq_m", sa.Float),
        sa.Column("area_original", sa.String(128)),
        sa.Column("land_class", sa.String(64)),
        sa.Column("owner_names", postgresql.ARRAY(sa.String)),
        sa.Column("parcel_id", sa.String(36), sa.ForeignKey("parcels.id")),
        sa.Column("status", sa.String(32), server_default="pending"),
        sa.Column("ulpin", sa.String(14)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )
    op.execute("CREATE INDEX ix_land_records_owner_names ON land_records USING GIN(owner_names)")

    # audit_log
    op.create_table(
        "audit_log",
        sa.Column("id", sa.BigInteger, primary_key=True, autoincrement=True),
        sa.Column("ts", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("actor", sa.String(36)),
        sa.Column("action", sa.String(128), nullable=False),
        sa.Column("entity_type", sa.String(64)),
        sa.Column("entity_id", sa.String(128)),
        sa.Column("payload", postgresql.JSONB),
        sa.Column("prev_hash", sa.String(64)),
        sa.Column("hash", sa.String(64), nullable=False),
    )
    op.create_index("ix_audit_log_ts", "audit_log", ["ts"])

    # lexicon
    op.create_table(
        "lexicon",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("kind", sa.String(32), nullable=False),
        sa.Column("variant", sa.String(256), nullable=False),
        sa.Column("canonical", sa.String(256), nullable=False),
        sa.Column("count", sa.Integer, server_default="1"),
        sa.Column("source", sa.String(64)),
    )
    op.create_index("ix_lexicon_kind_variant", "lexicon", ["kind", "variant"])

    # model_metrics
    op.create_table(
        "model_metrics",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("model_version", sa.String(32), nullable=False),
        sa.Column("eval_set", sa.String(32), nullable=False),
        sa.Column("metric", sa.String(64), nullable=False),
        sa.Column("value", sa.Float, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # processing_stats
    op.create_table(
        "processing_stats",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("day", sa.Date, nullable=False),
        sa.Column("state_code", sa.String(8)),
        sa.Column("district_code", sa.String(8)),
        sa.Column("docs_processed", sa.Integer, server_default="0"),
        sa.Column("docs_accepted", sa.Integer, server_default="0"),
        sa.Column("docs_review", sa.Integer, server_default="0"),
        sa.Column("field_accuracy", sa.Float),
        sa.Column("avg_confidence", sa.Float),
        sa.Column("is_seed", sa.Boolean, server_default="false"),
        sa.UniqueConstraint("day", "state_code", "district_code", name="uq_stat_day_district"),
    )

    # notifications
    op.create_table(
        "notifications",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("channel", sa.String(32)),
        sa.Column("to_addr", sa.String(256)),
        sa.Column("template", sa.String(64)),
        sa.Column("payload", postgresql.JSONB),
        sa.Column("status", sa.String(32), server_default="queued"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
    )

    # validation_rules
    op.create_table(
        "validation_rules",
        sa.Column("id", sa.String(8), primary_key=True),
        sa.Column("description", sa.Text, nullable=False),
        sa.Column("severity", sa.String(16), server_default="error"),
        sa.Column("enabled", sa.Boolean, server_default="true"),
        sa.Column("category", sa.String(32)),
    )

    # lrms_records (mock LRMS)
    op.create_table(
        "lrms_records",
        sa.Column("id", sa.String(36), primary_key=True),
        sa.Column("village_code", sa.String(16), nullable=False),
        sa.Column("khasra_no", sa.String(64), nullable=False),
        sa.Column("owner_name", sa.String(256)),
        sa.Column("area_sq_m", sa.Float),
        sa.Column("land_class", sa.String(64)),
        sa.Column("ref_id", sa.String(64)),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now()),
        sa.UniqueConstraint("village_code", "khasra_no", name="uq_lrms_village_khasra"),
    )


def downgrade() -> None:
    for tbl in [
        "lrms_records", "validation_rules", "notifications", "processing_stats",
        "model_metrics", "lexicon", "audit_log", "land_records", "parcels",
        "ownership_edges", "persons", "corrections", "review_tasks",
        "validation_results", "fields", "extractions", "pages", "documents", "users",
    ]:
        op.drop_table(tbl)
