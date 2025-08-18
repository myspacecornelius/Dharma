
import random
from faker import Faker
from sqlalchemy.orm import Session
from backend.core.database import SessionLocal
from backend.models.user import User
from backend.models.post import Post
from backend.models.release import Release
from backend.core.security import get_password_hash
from datetime import datetime, timedelta

fake = Faker()

def seed_data():
    db: Session = SessionLocal()

    # Create 50 fake users
    users = []
    for _ in range(50):
        user = User(
            username=fake.user_name(),
            email=fake.email(),
            display_name=fake.name(),
            avatar_url=fake.image_url(),
            password_hash=get_password_hash("password"),
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

    # Create 10 fake releases
    for _ in range(10):
        release = Release(
            sneaker_name=f"{random.choice(['Air Jordan', 'Yeezy', 'Nike Dunk'])} {random.randint(1, 15)}",
            brand=random.choice(["Nike", "Adidas"]),
            release_date=datetime.utcnow() + timedelta(days=random.randint(1, 90)),
            retail_price=random.randint(100, 300),
            store_links={"store1": fake.url(), "store2": fake.url()}
        )
        db.add(release)

    db.commit()
    db.close()

if __name__ == "__main__":
    seed_data()

