INSERT INTO Status (Content) values ('available'), ('dnd'), ('away'), ('busy'), ('rightback'), ('offline');
INSERT INTO Designations (Role) values ('CEO'), ('CTO'), ('Probationer'), ('Intern'), ('Programmer analyst'), ('Solution Analyst'), ('Group Lead'), ('Group Director');

--create admin (CEO) current password - 12345678
INSERT INTO Profiles (FirstName, LastName, UserName, Email, Password, CreatedBy, CreatedAt, LastUpdatedBy, LastUpdatedAt,DesignationId, StatusId, IsDeleted)
	values ('Dhruv', 'Vagadiya', 'dvagadiya', 'dvagadiyaa@argusoft.com', '3jRyNpopG95WHkhw9ncvRM+4nsvwuNXP5pKfC1493II=', 1, GETDATE(),1,GETDATE(),1,1,0);

INSERT INTO Salts (UserId, UsedSalt) values (1, 'mQcB1ZgH5gSwI5olEKlmZA==');