
namespace ChatApp.Business.Helpers
{
    public static class ClaimsConstant
    {
        public const string FirstNameClaim = "firstName";
        public const string LastNameClaim = "lastName";
        public const string ImageUrlClaim = "imageUrl";
        public const string DesignationClaim = "designation";
    }
    public static class ProfileType
    {
        public static readonly int User = 1;
        public static readonly int Administrator = 2;
    }

    public static class DesignationType
    {
        public static readonly int CEO = 1;
        public static readonly int CTO = 2;
    }

    
}
