
import random
from faker import Faker
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.models.user import User
from backend.models.post import Post

fake = Faker()

def seed_data():
    db: Session = SessionLocal()

    # Create 50 fake users
    users = []
    for _ in range(50):
        user = User(
            username=fake.user_name(),
            display_name=fake.name(),
            avatar_url=fake.image_url(),
            is_anonymous=random.choice([True, False])
        )
        users.append(user)
        db.add(user)

    db.commit()

    # Create 200 fake posts
    for _ in range(200):
        post = Post(
            user_id=random.choice(users).user_id,
            content_type=random.choice(['text', 'image', 'video']),
            content_text=fake.text() if random.random() > 0.3 else None,
            media_url=fake.image_url() if random.random() > 0.5 else None,
            tags=random.sample(['#Jordan4', '#Nike', '#Restock', '#tech', '#art'], k=random.randint(1, 4)),
            geo_tag_lat=float(fake.latitude()),
            geo_tag_long=float(fake.longitude()),
            visibility=random.choice(['public', 'local', 'friends'])
        )
        db.add(post)

    db.commit()
    db.close()

if __name__ == "__main__":
    seed_data()

