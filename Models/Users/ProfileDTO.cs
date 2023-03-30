using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Users
{
    public class ProfileDTO
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int Id { get; set; }
    }
}
