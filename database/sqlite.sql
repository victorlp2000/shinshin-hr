/*
    run this script by using:
      $ sqlite3 review.db < slqite.sql
*/

DROP TABLE IF EXISTS hr_volunteer;
DROP TABLE IF EXISTS hr_role;

CREATE TABLE IF NOT EXISTS hr_volunteer (
    id              INTEGER PRIMARY KEY AUTOINCREMENT,
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
.import hr_volunteer.csv hr_volunteer
.import hr_role.csv hr_role

/* insert volunteer to role table as group 'Z' */
INSERT INTO hr_role (code, role) VALUES('Z','义工列表');
INSERT INTO hr_role(code, role, volunteer_id) SELECT 'Z001','',volunteer_id FROM hr_volunteer;

select * from hr_volunteer;
select * from hr_role;
select count(*) from hr_role;
