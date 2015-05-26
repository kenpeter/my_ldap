// https://www.npmjs.com/package/ldapjs
var ldap = require('ldapjs');
var config  = require('./config');
var program = require('commander');
var print_r = require('print_r').print_r;

var my_filter = 'none';

var ldap_username = '';
var ldap_password = '';
var ldap_url = '';
var ldap_dn_search = '';

// Usage:
// * node my_ldap.js -s ad --mail test@test.com
// * node my_ldap.js -s ad --full-name "who ever" 
// * node my_ldap.js -s ad --username username 
// * node my_ldap.js -s ad --is-arts --mail test@test.com 
//
// * node my_ldap.js -s cen --mail test@test.com
// * node my_ldap.js -s cen --full-name "who ever"
// * node my_ldap.js -s cen --username username 
// 
// * node my_ldap.js -s stu --mail test@test.com
// * node my_ldap.js -s stu --full-name "who ever" 
// * node my_ldap.js -s stu --username username 
//
// Ctrl-c to exit

program
  .version('0.0.1')
  .option('-s, --server []', 'Use ad, centaur or student ldap server')
  
  .option('-a, --mail []', 'filter by uni email address')
  .option('-b, --full-name []', 'filter by full name')
  .option('-c, --username []', 'filter by username')
  .option('-d, --is-arts', 'check if this person belongs to arts')

  .parse(process.argv);


// Server
if(program.server) {
  if(program.server == 'ad') {
    ldap_username = config.ad.username;
    ldap_password = config.ad.password;

    ldap_url = config.ad.url;
    ldap_dn_search = config.ad.dn_search;

    // This overwrite the mail option
    if(program.isArts) {
      console.log('You choose --is-arts option: %s', program.isArts);
      console.log('You enter mail address: %s', program.mail);
      
      my_filter = "(&(objectCategory=person)(objectClass=user)" + "(mail=" + program.mail + "))";  
    }
    else if(program.mail) {
      console.log('You enter mail address: %s', program.mail);
      my_filter = "(&(objectCategory=person)(objectClass=user)(mail=" + program.mail + "))";
    }
    else if(program.fullName) {
      console.log('You enter full name: %s', program.fullName);
      var tmp_array = program.fullName.split(' ');
      var given_name = tmp_array[0];
      var surname = tmp_array[1];

      my_filter = "(&(objectCategory=person)(objectClass=user)" + "(givenname=" + given_name + ")" + "(sn=" + surname + "))"; 
    }
    else if(program.username) {
      console.log('You enter username: %s', program.username);
      my_filter = "(&(objectCategory=person)(objectClass=user)" + "(cn=" + program.username + "))";
    }
    else {
      console.log('You need to specify either mail, fullname or username');
    }
       
  }
  else if(program.server == 'cen') {
    ldap_url = config.centaur.url;
    ldap_dn_search = config.centaur.dn_search;

		if(program.mail) {
  		console.log('You enter mail address: %s', program.mail);
  		my_filter = "(mail=" + program.mail + ")";
		}
		else if(program.fullName) {
  		console.log('You enter full name: %s', program.fullName);

  		var tmp_array = program.fullName.split(' ');
  		var given_name = tmp_array[0];
  		var surname = tmp_array[1];

  		my_filter = "(&(givenname=" + given_name + ")" + "(sn=" + surname + "))" 
		}
		else if(program.username) {
  		console.log('You enter username: %s', program.username);
  		my_filter = "(uid=" + program.username + ")";
		} 
		else {
      console.log('You need to specify either mail, fullname or username');
    }
		
  }
  else if(program.server == 'stu') {
    ldap_username = config.stu.username;
    ldap_password = config.stu.password;

    ldap_url = config.stu.url;
    ldap_dn_search = config.stu.dn_search;

		if(program.mail) {
      console.log('You enter mail address: %s', program.mail);
      my_filter = "(&(objectCategory=person)(objectClass=user)(mail=" + program.mail + "))";
    }
		else if(program.fullName) {
      console.log('You enter full name: %s', program.fullName);
      var tmp_array = program.fullName.split(' ');
      var given_name = tmp_array[0];
      var surname = tmp_array[1];

      my_filter = "(&(objectCategory=person)(objectClass=user)" + "(givenname=" + given_name + ")" + "(sn=" + surname + "))";
    }	
		else if(program.username) {
      console.log('You enter username: %s', program.username);
      my_filter = "(&(objectCategory=person)(objectClass=user)" + "(cn=" + program.username + "))";
    }	
  }
  else {
    console.log('Need -s ldap server');
  }
}
else {

}

console.log("You filter is: " + my_filter);


//http://stackoverflow.com/questions/20082893/unable-to-verify-leaf-signature
process.env['NODE_TLS_REJECT_UNAUTHORIZED'] = '0';


console.log(ldap_url);
console.log(ldap_dn_search);
console.log(ldap_username);
console.log(ldap_password);
console.log("\n\n");

ldap.Attribute.settings.guid_format = ldap.GUID_FORMAT_B;

var client = ldap.createClient({
  url: ldap_url 
});

// https://www.drupal.org/node/73347
var opts = {
  filter: my_filter,
  scope: 'sub',
};


client.bind(ldap_username, ldap_password, function (err) {
  
  client.search(ldap_dn_search, opts, function (err, search) {
    search.on('searchEntry', function (entry) {
      var user = entry.object;
      console.log(user);
    });
  });
   

});

//process.exit(0);
