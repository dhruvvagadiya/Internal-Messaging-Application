using ChatApp.Business.Helpers;
using ChatApp.Context;
using ChatApp.Context.EntityClasses;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Newtonsoft.Json.Linq;
using System;
using System.Linq;

namespace ChatApp.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class DesignationController : ControllerBase
    {
        private readonly ChatAppContext _context;

        public DesignationController(ChatAppContext context)
        {
            _context = context;
        }

        [AllowAnonymous]
        [HttpGet("getAll")]
        public IActionResult GetAll()
        {
            IQueryable<Designation> list = _context.Designations.Where(e => !e.Role.Equals("CEO") && !e.Role.Equals("CTO"));
            return Ok(list.ToList());
        }

        [Authorize(Policy ="Admin")]
        [HttpGet("all")]
        public IActionResult AllList()
        {
            var Designation = JwtHelper.GetRoleFromRequest(Request);

            var returnObj = _context.Designations.Where(e => !e.Role.ToLower().Equals("ceo"));
            if (Designation.Equals("CTO"))
            {
                returnObj = returnObj.Where(e => !e.Role.ToLower().Equals("cto"));
            }

            return Ok(returnObj.ToList());
        }
    }
}
