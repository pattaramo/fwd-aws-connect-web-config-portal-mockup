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
    role: {
      id: "",
      role: "",
      recordvoice: "",
      userview:"",
      historyview:"",
      deleterecord:"",
      recorddownload:"",
      edituser:"",
      deleteuser:"",
      editrole:"",
      viewrole:""
    },
    confirmation: '',
    checkboxValue: false
  },
  async mounted() {
    //==== Check MSAL Authentication ====//
    //sessionInfo = await validate_access();
    this.user_role = "admin";
    if (sessionStorage.getItem('jwt')) {
      this.jwt = sessionStorage.getItem('jwt');
    }
    await this.request_role_api();

    //this.results = await this.reqeust_holiday_selectAll();
    this.tbl_element = $('#result-datatable').DataTable();

    // When load all content is complete will active Add, Edit button
    this.load_data_complete = true;
  },
  methods: {
    add_role: function () {
      this.method = "Add";
    },
    load_role_data: function (data) {
      this.method = "Update";
      this.role.id = data.id;
      this.role.role = data.role;
      this.role.recordvoice = data.recordvoice;
      this.role.userview = data.userview;
      this.role.historyview = data.historyview;
      this.role.deleterecord = data.deleterecord;
      this.role.recorddownload = data.recorddownload;
      this.role.edituser = data.edituser;
      this.role.deleteuser = data.deleteuser;
      this.role.editrole = data.editrole;
      this.role.viewrole = data.viewrole;
    },
    updateCheckboxValue: function (event) {
      if (event.target.checked) {
          event.target.value = "1";
      } else {
          event.target.value = "0";
      }
    },
    formSubmit: async function (event) {
      $("#roleForm").find("input[type=text], textarea").val("");
      this.role.role = $('#rolename').val();
      this.role.recordvoice = $('#RecordingView').val();
      this.role.userview = $('#UserProfileView').val();
      this.role.historyview = $('#HistoryView').val();
      this.role.deleterecord = $('#DeleteRecording').val();
      this.role.recorddownload = $('#RecordingDownload').val();
      this.role.edituser = $('#EditUserProfile').val();
      this.role.deleteuser = $('#DeleteUserProfile').val();
      this.role.viewrole = $('#ViewRole').val();
      this.role.editrole = $('#EditRole').val();
      //this.role.permission = $('#permission').val();
      if (this.method === "Add") {
        await this.reqeust_role_insert(this.role);
      }
      else if (this.method === "Update") {
        await this.reqeust_role_update(this.role);
      }
      resetForm();
      $('#ModalCenter').modal('hide');
      await this.request_role_api();
    },
    remove_userrole: async function (id) {
      this.role.status = -1;
      await this.reqeust_role_remove(id);
      $('#exampleModalCenter').modal('hide');
      await this.request_role_api();
    },
    signout: function () {
      deleteCookies();
      location.href = '/playback-portal-s3/index.html';
    },
    request_role_api: async function () {
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.jwt
        }
      };
      await axios.get(`${this.host_api}/playback-portal/user_role`, options)
        .then((response) => {
          let temp = [];
          for (let row of response.data) {
            console.log(row)
            temp.push(row);
          }
          this.results = temp;
          for (let i = 0; i < this.results.length; i++) {
            for (let j = 1; j <= 9; j++) {
              let key = `check${j}`;
              if (this.results[i][key] === '1') {
                document.getElementById(key + (i + 1)).innerHTML = '<i class="fas fa-check"></i>';
              } else {
                document.getElementById(key + (i + 1)).innerHTML = '-';
              }
            }
          }
        })
        .catch(error => {
          console.log('Error: ', error)
        })
    },
    reqeust_role_insert: async function (data) {
      var resp = {};
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.jwt
          //'X-Vault-Token': sessionStorage.getItem('token')
        }
      };
          await axios.post(`${this.host_api}/playback-portal/user_role`, data, options)
            .then((response) => {
              resp = response.data;
            })
            .catch(error => {
              //validateHTTPResponse(error);
            })
          return resp;
        },
        reqeust_role_update: async function (data) {
          var resp = {};
          let options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.jwt
              //'X-Vault-Token': sessionStorage.getItem('token')
            }
          };
          await axios.put(`${this.host_api}/playback-portal/user_role`, data, options)
            .then((response) => {
              resp = response;
            })
            .catch(error => {
              //validateHTTPResponse(error);
            })
          return resp;
        },
        reqeust_role_remove: async function (id) {
          var resp = {};
          let options = {
            headers: {
              'Content-Type': 'application/json',
              'Authorization': this.jwt
            }
          };
          await axios.delete(`${this.host_api}/playback-portal/user_role/delete?id=${id}`, options)
            .then((response) => {
              resp = response;
            })
            .catch(error => {
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
  document.getElementById("roleForm").reset(); // เรียกใช้งานฟังก์ชันเคลียร์ค่าในฟอร์มด้วย ID
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

function forceUpperCase(str) {
  try {
    let prefix = str.substring(0, 1).toUpperCase();
    let postfix = str.substring(1);
    return prefix + postfix;
  }
  catch (error) {
    return ""
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