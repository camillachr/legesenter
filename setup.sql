
DROP DATABASE IF EXISTS eksamen_camilla_christensen;
CREATE DATABASE IF NOT EXISTS eksamen_camilla_christensen;
USE eksamen_camilla_christensen;

CREATE TABLE users (
	id		 		INT AUTO_INCREMENT PRIMARY KEY,
	first_name 		VARCHAR(100) NOT NULL,
	last_name 		VARCHAR(100) NOT NULL,
	email	 		VARCHAR(255) NOT NULL UNIQUE,
	password_hash	VARCHAR(255) NOT NULL, 
    role_type		ENUM('patient','admin')
);

CREATE TABLE doctors (
	id		 			INT AUTO_INCREMENT PRIMARY KEY, 
	first_name 			VARCHAR(100) NOT NULL,
	last_name 			VARCHAR(100) NOT NULL,
	specialization		VARCHAR(255) NOT NULL,
	availability_start	TIME NOT NULL,
	availability_end	TIME NOT NULL
        
);

CREATE TABLE appointments (
	id		 			INT AUTO_INCREMENT PRIMARY KEY,
	user_id 			INT,
	doctor_id 			INT NOT NULL,
    appointment_date 	DATE NOT NULL,
	start_time			TIME NOT NULL,
	end_time			TIME, 
    message				TEXT,
    appointment_status	ENUM('booket','ledig') DEFAULT 'ledig',			
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,  
    FOREIGN KEY (doctor_id) REFERENCES doctors(id) ON DELETE CASCADE
    
);

CREATE TABLE token_blacklist (
	token			varchar(255)			
);

INSERT INTO users (first_name, last_name, email, password_hash, role_type) VALUES
('John', 'Doe', 'john.doe@example.com', 'hashedpassword123', 'patient'),
('Jane', 'Smith', 'jane.smith@example.com', 'hashedpassword456', 'patient'),
('Alice', 'Johnson', 'alice.johnson@example.com', 'hashedpassword789', 'patient');

INSERT INTO doctors (first_name, last_name, specialization, availability_start, availability_end) VALUES
('Dr. Emily', 'Clark', 'Cardiologist', '08:00:00', '14:00:00'),
('Dr. Michael', 'Brown', 'Dermatologist', '09:00:00', '15:00:00'),
('Dr. Linda', 'Green', 'General Practitioner', '08:30:00', '15:30:00');

INSERT INTO appointments (user_id, doctor_id, appointment_date, start_time, end_time, message, appointment_status) 
VALUES (1, 1, '2023-10-23', '08:00:00', '08:15:00', 'Første konsultasjon', 'booket');


select * from appointments;



