"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.RoleHierarchy = exports.UserRole = void 0;
var UserRole;
(function (UserRole) {
    UserRole["SUPER_ADMIN"] = "SUPERADMIN";
    UserRole["UNIVERSITY_ADMIN"] = "UNI_ADMIN";
    UserRole["COLLEGE_ADMIN"] = "COLLEGE_ADMIN";
    UserRole["DEPARTMENT_ADMIN"] = "DEPT_ADMIN";
    UserRole["FACULTY"] = "FACULTY";
    UserRole["STUDENT"] = "STUDENT";
    UserRole["PARENT"] = "PARENT";
    UserRole["LIBRARIAN"] = "LIBRARIAN";
    UserRole["PLACEMENT_OFFICER"] = "PLACEMENT_OFFICER";
    UserRole["APPROVAL_ADMIN"] = "APPROVAL_ADMIN";
    UserRole["PUBLIC"] = "PUBLIC";
})(UserRole || (exports.UserRole = UserRole = {}));
exports.RoleHierarchy = {
    'SUPERADMIN': 100,
    'UNI_ADMIN': 90,
    'COLLEGE_ADMIN': 80,
    'DEPT_ADMIN': 70,
    'FACULTY': 60,
    'APPROVAL_ADMIN': 55,
    'LIBRARIAN': 50,
    'PLACEMENT_OFFICER': 50,
    'STUDENT': 40,
    'PARENT': 30,
    'PUBLIC': 10
};
