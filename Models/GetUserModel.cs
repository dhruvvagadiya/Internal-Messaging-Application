using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models
{
    public class GetUserModel
    {
        public string FirstName { get; set; }
        public string LastName { get; set; }
        public int Id { get; set; }
    }
}
