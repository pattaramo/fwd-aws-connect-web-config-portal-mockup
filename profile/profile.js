var router = new VueRouter({
  mode: 'history',
  routes: []
});

var app = new Vue({
  el: '#app',
  router,
  data: {
    host_api: "https://v6brfm2vjc.execute-api.ap-southeast-1.amazonaws.com/default",
    jwt: "",
    cache: {},
    method: "",
    results: [],
    nav: {
      displayName: ""
    },
    user_role:"",
    form: {
      remove_keyword: ""
    },
    profile_user: {
      id: "",
      role: "",
      email: "",
      status: 0
    },
    row: {
        email: '',
        role: '',
      },
    holiday_related: [],
    load_data_complete: false,
    confirmation: ''
  },
  async mounted() {
    //==== Check MSAL Authentication ====//
    //sessionInfo = await validate_access();
    this.user_role = "admin";
    if (sessionStorage.getItem('jwt')) {
      this.jwt = sessionStorage.getItem('jwt');
    }
    await this.reqeust_profile_selectAll();

    //this.results = await this.reqeust_holiday_selectAll();
    this.tbl_element = $('#result-datatable').DataTable();

    // When load all content is complete will active Add, Edit button
    this.load_data_complete = true;
  },
  methods: {
    add_profile: function () {
      this.method = "Add";
    },
    load_profile_detail: function (data) {
      this.method = "Update";
    },

    formSubmit: async function () {
      
      if (this.method === "Add") {
        $("#profileForm").find("input[type=text], textarea").val("");
        this.profile_user.email = $('#addemail').val();
        this.profile_user.role = $('#addrole').val();
        await this.reqeust_profile_insert(this.profile_user);
      }
      else if (this.method === "Update") {
        $("#editForm").find("input[type=text], textarea").val("");
        this.profile_user.id = $('#id').val();
        this.profile_user.email = $('#email').val();
        this.profile_user.role = $('#role').val();
        await this.reqeust_profile_update(this.profile_user);
      }
      resetForm();
      $('#ModalCenter').modal('hide');
      $('#formModal').modal('hide');
      
      await this.reqeust_profile_selectAll();
},
    remove_profile: async function (id) {
      // when user has remove a campaign will chanage status to -1
      this.profile_user.status = -1;
      await this.reqeust_profile_remove(id);
      $('#exampleModalCenter').modal('hide');
      await this.reqeust_profile_selectAll();
    },
    
    signout: function () {
      deleteCookies();
      location.href = '/playback-portal-s3/index.html';
    },
    
    reqeust_profile_selectAll: async function () {
      var resp = {};
      var temp_result = [];
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.jwt
          //'X-Vault-Token': sessionStorage.getItem('token')
        }
      };
      await axios.get(`${this.host_api}/playback-portal/profile`, options)
        .then((response) => {
          let temp = [];
          // Force convert time formatted
          for (let row of response.data) {
            console.log(row)
            temp.push(row);
          }
          this.results = temp; // Set results value to the temp variable
        })
        .catch(error => {
          console.log('Error: ', error)
          //validateHTTPResponse(error);
        })},
    reqeust_profile_insert: async function (data) {
      var resp = {};
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.jwt
          //'X-Vault-Token': sessionStorage.getItem('token')
        }
      };
          await axios.post(`${this.host_api}/playback-portal/profile`, data, options)
            .then((response) => {
              resp = response.data;
            })
            .catch(error => {
              //validateHTTPResponse(error);
            })
          return resp;
        },

        reqeust_profile_update: async function (data) {
          var resp = {};
          let options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.jwt
              //'X-Vault-Token': sessionStorage.getItem('token')
            },
            
          };
          await axios.put(`${this.host_api}/playback-portal/profile`, data, options)
            .then((response) => {
              resp = response;
            })
            .catch(error => {
              //validateHTTPResponse(error);
            })
          return resp;
        },

        reqeust_profile_remove: async function (id) {
          var resp = {};
          let options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.jwt
            }
          };
          await axios.delete(`${this.host_api}/playback-portal/profile/delete?id=${id}`, options)
            .then((response) => {
              resp = response;
            })
            .catch(error => {
              console.log(error);
              //validateHTTPResponse(error);
            })
          return resp;
        },
        data: function () {
          return {
            confirmation: '',
          }
        },
  },
  watch: {
    results: function (val) {
      this.tbl_element.destroy();
      this.$nextTick(() => {
        this.tbl_element = $('#result-datatable').DataTable({
          order: [[0, "asc"]],
          aLengthMenu: [
            [10, 20, 50, 100, -1],
            [10, 20, 50, 100, "All"]
          ],
          iDisplayLength: 10
        });
      });
    }
  }
});

function resetForm() {
  document.getElementById("profileForm").reset(); // เรียกใช้งานฟังก์ชันเคลียร์ค่าในฟอร์มด้วย ID
}

function validateHTTPResponse(err) {
  const loginURL = '/playback-portal-s3/index.html'
  const errorURL = '/playback-portal-s3/500.html'

  if (typeof err.response == 'undefined') {
    location.href = loginURL
  }
  else {
    if (err.response.status === 400 || err.response.status === 401) {
      location.href = loginURL
    }
    else {
      alert(`Error ${err.response.status.toString()}: ${err.message}`);
      location.href = errorURL
    }
  }
}

function deleteCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/playback-portal";
  }
}

