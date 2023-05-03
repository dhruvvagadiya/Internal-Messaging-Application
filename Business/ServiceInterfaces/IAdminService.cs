using ChatApp.Context.EntityClasses;
using ChatApp.Models.Auth;
using ChatApp.Models.Users;
using System.Collections.Generic;
using System.Threading.Tasks;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface IAdminService
    {
        IEnumerable<AdminProfileDTO> GetAll();

        Task<AdminProfileDTO> UpdateEmployeeDetails(AdminProfileDTO details, Profile User);

        Task<bool> DeleteEmployee(string UserName);

        AdminProfileDTO AddUser(RegisterModel regModel, string salt);
    }
}
