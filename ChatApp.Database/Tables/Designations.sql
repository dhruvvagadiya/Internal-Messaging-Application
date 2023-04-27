CREATE TABLE [dbo].[Designations]
(
	[Id] INT IDENTITY(1,1) PRIMARY KEY, 
    [Role] VARCHAR(100) NOT NULL
)

/* insert into Designations(Role) values ('Programmer analyst'), ('Solution Analyst'), ('Group Lead'), ('Group Director');   */