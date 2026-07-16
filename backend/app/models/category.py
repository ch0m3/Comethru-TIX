from app.extensions import db

# Many-to-many join table between events and categories.
event_categories = db.Table(
    "event_categories",
    db.Column("event_id", db.Integer, db.ForeignKey("events.id"), primary_key=True),
    db.Column("category_id", db.Integer, db.ForeignKey("categories.id"), primary_key=True),
)


class Category(db.Model):
    __tablename__ = "categories"

    id = db.Column(db.Integer, primary_key=True)
    name = db.Column(db.String(80), nullable=False, unique=True)

    def to_dict(self):
        return {"id": self.id, "name": self.name}
