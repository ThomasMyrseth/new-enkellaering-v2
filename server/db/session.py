import os

from flask import g
from sqlalchemy import create_engine
from sqlalchemy.orm import Session, sessionmaker

_engine = None
_SessionLocal = None


def _get_engine():
    global _engine, _SessionLocal
    if _engine is None:
        database_url = os.environ["POSTGRES_URL"]
        _engine = create_engine(database_url, pool_pre_ping=True)
        _SessionLocal = sessionmaker(bind=_engine, expire_on_commit=False)
    return _engine


def get_session() -> Session:
    """Returns the current request's SQLAlchemy session, creating it if needed."""
    if "db_session" not in g:
        _get_engine()
        g.db_session = _SessionLocal()
    return g.db_session


def close_session(exception=None) -> None:
    session = g.pop("db_session", None)
    if session is not None:
        if exception is not None:
            session.rollback()
        session.close()


def init_app(app) -> None:
    app.teardown_appcontext(close_session)
