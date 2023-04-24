    CREATE TABLE [dbo].[Profiles]
    (
        [Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY, 
        [FirstName] NVARCHAR(1000) NOT NULL, 
        [LastName] NVARCHAR(1000) NOT NULL, 
        [UserName] NVARCHAR(1000) NULL, 
        [Email ] NVARCHAR(1000) NULL, 
        [Password] NVARCHAR(MAX) NULL, 
        [ImageUrl] NVARCHAR(100) NULL,
        [ProfileType] INT NOT NULL,
        [CreatedAt] DATETIME2 NULL, 
        [CreatedBy] INT NULL, 
        [LastUpdatedAt] DATETIME2 NULL, 
        [LastUpdatedBy] INT NULL, 
        [LastSeen] DATETIME2 NULL DEFAULT GETDATE(), 
        [Designation] NVARCHAR(50) DEFAULT 'Employee', 
        [StatusId] INT NULL,
        CONSTRAINT [FK_Profiles_UerStatus_To_Status] FOREIGN KEY ([StatusId]) REFERENCES dbo.Status(Id),
    )
