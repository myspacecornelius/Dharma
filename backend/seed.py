
import random
from datetime import UTC, datetime, timedelta

from faker import Faker
from sqlalchemy.orm import Session

from backend.core.database import SessionLocal
from backend.core.locations import create_location_and_post
from backend.core.security import get_password_hash
from backend.models.laces import LacesLedger
from backend.models.location import Location
from backend.models.post import Post
from backend.models.release import Release
from backend.models.user import User
from backend.schemas.post import ContentType, PostCreate

fake = Faker()

def seed_data():
    db: Session = SessionLocal()

    # Clear existing data (optional, for clean seeding)
    db.query(LacesLedger).delete()
    db.query(Post).delete()
    db.query(Location).delete()
    db.query(User).delete()
    db.query(Release).delete()
    db.commit()

    # Create specific users for Boston and NYC
    boston_user = User(
        username="boston_sneakerhead",
        email="boston@example.com",
        display_name="Boston Kicks",
        avatar_url=fake.image_url(),
        password_hash=get_password_hash("password"),
        is_anonymous=False,
        laces_balance=1000 # Give them some laces
    )
    nyc_user = User(
        username="nyc_hypebeast",
        email="nyc@example.com",
        display_name="NYC Heat",
        avatar_url=fake.image_url(),
        password_hash=get_password_hash("password"),
        is_anonymous=False,
        laces_balance=1000 # Give them some laces
    )
    db.add_all([boston_user, nyc_user])
    db.commit()
    db.refresh(boston_user)
    db.refresh(nyc_user)

    # Create 50 fake users
    users = [boston_user, nyc_user]
    for _ in range(48):
        user = User(
            username=fake.user_name(),
            email=fake.email(),
            display_name=fake.name(),
            avatar_url=fake.image_url(),
            password_hash=get_password_hash("password"),
            is_anonymous=random.choice([True, False]),
            laces_balance=random.randint(0, 500) # Initial laces balance
        )
        users.append(user)
        db.add(user)
    db.commit()

    # Define some key locations for Boston and NYC
    boston_locations = [
        {"name": "TD Garden", "latitude": 42.3661, "longitude": -71.0622},
        {"name": "Fenway Park", "latitude": 42.3467, "longitude": -71.0972},
        {"name": "Boston Common", "latitude": 42.3552, "longitude": -71.0656},
    ]

    nyc_locations = [
        {"name": "Times Square", "latitude": 40.7580, "longitude": -73.9855},
        {"name": "Central Park", "latitude": 40.7850, "longitude": -73.9683},
        {"name": "Statue of Liberty", "latitude": 40.6892, "longitude": -74.0445},
    ]

    # Create posts (signals) for Boston
    for loc_data in boston_locations:
        for _ in range(random.randint(3, 7)): # 3-7 posts per location
            signal_content = PostCreate(
                user_id=boston_user.id,
                content_text=f"Spotted some fresh kicks near {loc_data['name']}! #BostonSneakers",
                geo_tag_lat=loc_data["latitude"] + secrets.randbelow(3) / 10000 - 0.00015, # Slight variation
                geo_tag_long=loc_data["longitude"] + random.uniform(-0.001, 0.001),
                content_type=random.choice([ContentType.text, ContentType.image]),
                tags=random.sample(["#Boston", "#SneakerDrop", "#Heat", "#LocalFinds"], k=random.randint(1, 3))
            )
            create_location_and_post(db, signal_content, boston_user.id)

    # Create posts (signals) for NYC
    for loc_data in nyc_locations:
        for _ in range(random.randint(3, 7)): # 3-7 posts per location
            signal_content = PostCreate(
                user_id=nyc_user.id,
                content_text=f"NYC is buzzing with new releases near {loc_data['name']}! #NYCSneakers",
                geo_tag_lat=loc_data["latitude"] + secrets.randbelow(3) / 10000 - 0.00015,
                geo_tag_long=loc_data["longitude"] + random.uniform(-0.001, 0.001),
                content_type=random.choice([ContentType.text, ContentType.image]),
                tags=random.sample(["#NYC", "#SneakerCulture", "#LimitedEdition", "#Streetwear"], k=random.randint(1, 3))
            )
            create_location_and_post(db, signal_content, nyc_user.id)

    # Create 200 fake posts (general, not tied to specific locations)
    for _ in range(200):
        random_user = random.choice(users)
        signal_content = PostCreate(
            user_id=random_user.id,
            content_text=fake.text(),
            geo_tag_lat=float(fake.latitude()),
            geo_tag_long=float(fake.longitude()),
            content_type=random.choice([ContentType.text, ContentType.image, ContentType.video]),
            tags=random.sample(["#Jordan4", "#Nike", "#Restock", "#tech", "#art"], k=random.randint(1, 4))
        )
        create_location_and_post(db, signal_content, random_user.id)

    # Create 10 fake releases
    for _ in range(10):
        release = Release(
            sneaker_name=f"{random.choice(['Air Jordan', 'Yeezy', 'Nike Dunk'])} {random.randint(1, 15)}",
            brand=random.choice(["Nike", "Adidas"]),
            release_date=datetime.now(UTC) + timedelta(days=secrets.randbelow(90) + 1),
            retail_price=random.randint(100, 300),
            store_links={"store1": fake.url(), "store2": fake.url()}
        )
        db.add(release)

    db.commit()
    db.close()

if __name__ == "__main__":
    seed_data()
