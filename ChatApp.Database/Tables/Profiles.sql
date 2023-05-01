    CREATE TABLE [dbo].[Profiles]
    (
        [Id] INT IDENTITY (1, 1) NOT NULL PRIMARY KEY, 
        [FirstName] NVARCHAR(1000) NOT NULL, 
        [LastName] NVARCHAR(1000) NOT NULL, 
        [UserName] NVARCHAR(1000) NULL, 
        [Email] NVARCHAR(1000) NULL, 
        [Password] NVARCHAR(MAX) NULL, 
        [ImageUrl] NVARCHAR(100) NULL,
        [CreatedAt] DATETIME2 NULL, 
        [CreatedBy] INT NULL DEFAULT 1, 
        [LastUpdatedAt] DATETIME2 NULL, 
        [LastUpdatedBy] INT NULL DEFAULT 1, 
        [DesignationId] INT NOT NULL DEFAULT 3 , 
        [StatusId] INT NULL DEFAULT 1,
        [IsDeleted] INT NULL DEFAULT 0, 
    CONSTRAINT [FK_Profiles_UerStatus_To_Status] FOREIGN KEY ([StatusId]) REFERENCES dbo.Status(Id),
        CONSTRAINT [FK_Profiles_DesignationId_To_Designations] FOREIGN KEY ([DesignationId]) REFERENCES dbo.Designations(Id),
    )
