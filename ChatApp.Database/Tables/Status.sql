CREATE TABLE [dbo].[Status]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY(1,1), 
    [Content] NVARCHAR(20) NOT NULL DEFAULT 'Available'
)

/* INSERT INTO Status(Content) values ('Available'), ('Do not disturb'), ('Appear away'), ('Busy'), ('Be right back'), ('Appear offline');*/

