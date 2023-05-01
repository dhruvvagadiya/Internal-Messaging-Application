using System.ComponentModel.DataAnnotations;

namespace ChatApp.Models.Users
{
    public class AdminProfileDTO
    {
        [Required]
        public string FirstName { get; set; }
        [Required]
        public string LastName { get; set; }

        [Required]
        public string UserName { get; set; }

        [Required]
        [EmailAddress(ErrorMessage = "Please enter valid email address")]
        public string Email { get; set; }
        public string ImageUrl { get; set; }
        public string Designation { get; set; }

        [Required]
        public int DesignationId { get; set; }
    }
}
