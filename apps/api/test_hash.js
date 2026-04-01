
const bcrypt = require('bcrypt');
const hash = '$2b$12$2Jrt90jspTyJe2xLJvCddOr/qYc2BHvoAeLVAZOGTqmjUfRtbFY0q';
const password = 'password123';

bcrypt.compare(password, hash).then(res => {
    console.log('Match:', res);
    process.exit(0);
});
