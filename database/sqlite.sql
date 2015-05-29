/*
    run this script by using:
      $ sqlite3 review.db < slqite.sql
*/

DROP TABLE IF EXISTS hr_volunteers;
DROP TABLE IF EXISTS hr_role;

CREATE TABLE IF NOT EXISTS hr_volunteers (
    volunteer_id    INTEGER PRIMARY KEY AUTOINCREMENT,
    first_name      CHAR(40),
    last_name       CHAR(40),
    name            CHAR(255),
    photo_file      CHAR(255),
    description     CHAR(2048)
    );

CREATE TABLE IF NOT EXISTS hr_role (
    code            CHAR(20),
    role            CHAR(30),
    volunteer_id    INTEGER
    );

.schema

/* import data from CSV files */
.mode csv
.import hr_volunteers.csv hr_volunteers
.import hr_role.csv hr_role

/* insert volunteers to role table as group 'Z' */
INSERT INTO hr_role (code, role) VALUES('Z','义工列表');
INSERT INTO hr_role (code, role) VALUES('Z#','1,2');
INSERT INTO hr_role(code, role, volunteer_id) SELECT 'Z01','',volunteer_id FROM hr_volunteers;

select * from hr_volunteers;
select * from hr_role;
select count(*) from hr_role;
