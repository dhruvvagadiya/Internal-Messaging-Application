using ChatApp.Context.EntityClasses;
using ChatApp.Models.Users;
using System.Collections;
using System.Collections.Generic;

namespace ChatApp.Business.ServiceInterfaces
{
    public interface IAdminService
    {
        IEnumerable<AdminProfileDTO> GetAll();

        AdminProfileDTO UpdateEmployeeDetails(AdminProfileDTO details, Profile User);

        bool DeleteEmployee(string UserName);
    }
}
