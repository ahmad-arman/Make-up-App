DROP TABLE IF EXISTS make_up;
CREATE TABLE make_up (
    id SERIAL PRIMARY KEY,
    name VARCHAR(255),
    price VARCHAR(255),
    image_link VARCHAR(255),
    description TEXT
);
