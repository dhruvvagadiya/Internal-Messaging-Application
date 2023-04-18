CREATE TABLE [dbo].[Groups]
(
	[Id] INT NOT NULL PRIMARY KEY IDENTITY (1,1), 
    [Name] NVARCHAR(50) NOT NULL, 
    [ImageUrl] NVARCHAR(100) NULL,
    [CreatedBy] INT NOT NULL, 
    [CreatedAt] DATETIME2 NOT NULL DEFAULT GETDATE(), 
    [UpdatedAt] DATETIME2 NULL DEFAULT GETDATE(),
    [Description] NVARCHAR(50) NULL, 
    CONSTRAINT [FK_Groups_CreatedBy_To_Profiles] FOREIGN KEY (CreatedBy) REFERENCES dbo.Profiles(Id)
)
