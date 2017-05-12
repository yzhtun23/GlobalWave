using System.Collections.Generic;
using Microsoft.AspNetCore.Mvc;
using System.Linq;
using Microsoft.AspNetCore.Authorization;
using System.IdentityModel.Tokens.Jwt;
using Microsoft.AspNetCore.Http;

namespace TaxiApplication
{

    [Route("api/[controller]")]
    public class CompanyController : BaseController
    {
        private AppDb _objdb;

        public CompanyController(AppDb DB)
        {
            _objdb = DB;
        }

        [HttpGet("GetCompanyComboData", Name = "GetCompanyComboData")]
        [Authorize]
        public dynamic GetCompanyComboData()
        {
            dynamic objresult = null;
            objresult = _objdb.Company.ToList();

            dynamic objresponse = new { data = objresult };
            return objresponse;
        }

        [HttpPost("GetCompany", Name = "GetCompany")]
        [Authorize]
        public dynamic GetCompany()
        {
            var CompanyID = HttpContext.Request.Form["CompanyID"];
            var Active = HttpContext.Request.Form["Active"];

            var mainQuery = (from main in _objdb.Company
                             select main);

            if (CompanyID != "0")
            {
                mainQuery = (from main in mainQuery
                             where main.CompanyID == int.Parse(CompanyID)
                             select main);
            }

            if (Active == "true")
            {
                mainQuery = (from bk in mainQuery
                             where bk.IsActive == 1
                             select bk);
            }
            else
            {
                mainQuery = (from bk in mainQuery
                             where bk.IsActive == 0
                             select bk);
            }

            dynamic objresponse = new { data = mainQuery.ToList() };
            return objresponse;
        }

        [HttpDelete("DeleteCompanySetup/{CompanyID}", Name = "DeleteCompanySetup")]
        [Authorize]
        public dynamic DeleteCompanySetup(int CompanyID)
        {
            bool retBool = false;

            var objCompany = _objdb.Company.Find(CompanyID);
            if (objCompany != null)
            {
                string[] idname = new string[] { "CompanyID" };
                string[] id = new string[] { CompanyID.ToString() };
                string logmsg = _objdb.GetLogMessage("Info", "Delete", "tbl_Company", "", idname, id);

                _objdb.Remove(objCompany);
                _objdb.SaveChanges();
                retBool = true;
                _objdb.AddEventLog("Info", "Delete Company", logmsg, _tokenData.UserID, _tokenData.LoginType, _ipaddress);
            }

            dynamic objresponse = new { data = retBool };
            return objresponse;
        }

        [HttpPost("checkDuplicate", Name = "CompanycheckDuplicate")]
        [Authorize]
        public dynamic checkDuplicate()
        {
            var objstr = HttpContext.Request.Form["objCompanyInfo"];
            dynamic obj = Newtonsoft.Json.JsonConvert.DeserializeObject(objstr);
            dynamic objresult = null;
            int CompanyID = obj.CompanyID;
            string Email = obj.Email;

            var Emaillist = (
                       from adl in _objdb.Company
                       where adl.CompanyID != CompanyID && adl.Email == Email
                       select adl
                           ).ToList();

            objresult = new { Name = 0, Email = 0 };

            if (Emaillist.Count() > 0)
            {
                objresult = new { Name = 0, Email = 1 };
            }

            List<dynamic> dd = new List<dynamic>();
            dd.Add(objresult);
            dynamic objresponse = new { data = dd };
            return objresponse;
        }

        [HttpPost("AddCompany", Name = "AddCompany")]
        [Authorize]
        public dynamic AddCompany()
        {
            var objstr = HttpContext.Request.Form["objCompanyInfo"];
            dynamic obj = Newtonsoft.Json.JsonConvert.DeserializeObject(objstr);

            int CompanyID = obj.CompanyID;
            string logmsg = "";
            var objCompany = _objdb.Company.Find(CompanyID);
            if (objCompany != null)
            {
                //get event log message
                string[] idname = new string[] { "CompanyID" };
                string[] id = new string[] { CompanyID.ToString() };
                logmsg = _objdb.GetLogMessage("Info", "Update", "tbl_Company", obj.ContactName.ToString(), idname, id);

                objCompany.ContactName = obj.ContactName;
                objCompany.NoOfVehicles = obj.NoOfVehicles;
                objCompany.Address = obj.Address;
                objCompany.Email = obj.Email;
                objCompany.Phone = obj.Phone;
                objCompany.CompanyID = obj.CompanyID;
                objCompany.IsActive = obj.IsActive;
                _objdb.Update(objCompany);
                _objdb.SaveChanges();
            }
            else
            {
                var newobj = new Company();
                newobj.ContactName = obj.ContactName;
                newobj.NoOfVehicles = obj.NoOfVehicles;
                newobj.Address = obj.Address;
                newobj.Email = obj.Email;
                newobj.Phone = obj.Phone;
                newobj.CompanyID = obj.CompanyID;
                newobj.IsActive = obj.IsActive;
                newobj.created_date = System.DateTime.Now;
                newobj.modified_date = System.DateTime.Now;
                _objdb.Add(newobj);
                _objdb.SaveChanges();
                CompanyID = newobj.CompanyID;
            }

            if (logmsg == "")
            {
                string[] idname = new string[] { "CompanyID" };
                string[] id = new string[] { CompanyID.ToString() };
                logmsg = _objdb.GetLogMessage("Info", "Insert", "tbl_Company", obj.ContactName.ToString(), idname, id);
                _objdb.AddEventLog("Info", "Add Company", logmsg, _tokenData.UserID, _tokenData.LoginType, _ipaddress);
            }
            else
                _objdb.AddEventLog("Info", "Update Company", logmsg, _tokenData.UserID, _tokenData.LoginType, _ipaddress);

            dynamic objresponse = new { data = CompanyID };
            return objresponse;
        }
        [HttpPost("SaveImagePath", Name = "CompanySaveImagePath")]
        [Authorize]
        public dynamic SaveImagePath()
        {
            var objstr = HttpContext.Request.Form["objCompanyInfo"];
            dynamic obj = Newtonsoft.Json.JsonConvert.DeserializeObject(objstr);
            int CompanyID = obj.ID;
            string ext = obj.FileExt;
            string ImagePath = CompanyID.ToString() + '.' + ext;

            var objCompany = _objdb.Company.Find(CompanyID);
            dynamic objresponse;

            if (objCompany != null)
            {
                objCompany.LogoPath = ImagePath;
                _objdb.Update(objCompany);
                _objdb.SaveChanges();
                objresponse = new { data = true };
            }
            else
                objresponse = new { data = false };
            return objresponse;
        }
    }
}