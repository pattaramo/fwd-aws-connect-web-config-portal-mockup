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
    jwt_json: {},
    cache: {},
    results: [],
    nav: {
      displayName: ""
    },
    history: {
      id: "",
      change_by: "",
      action: "",
      timestamp: "",
      resource_id: ""
    }
  },
  async mounted() {
    if (sessionStorage.getItem('jwt')) {
      this.jwt = sessionStorage.getItem('jwt');
    }
    console.log(this.cache.action)

    this.tbl_element = $('#result-datatable').DataTable();
  },
  methods: {
    load_history_data: function (data) {
      this.method = "Update";
      this.history.id = data.id;
      this.history.change_by = data.change_by;
      this.history.action = data.action;
      this.history.timestamp = data.timestamp;
      this.history.resource_id = data.resource_id;

      $('#datePicker-start').val(data.active_start_date);
      $('#datePicker-end').val(data.active_end_date);
      flatpickr('#datePicker-start', {
        defaultDate: data.active_start_date
      });
      flatpickr('#datePicker-end', {
        defaultDate: data.active_end_date
      });
    },
    formSubmit: async function (event) {
      this.history.active_start_date = $('#datePicker-start').val();
      this.history.active_end_date = $('#datePicker-end').val();
      $('#formModal').modal('hide');
      await this.reqeust_history_select(this.history.active_start_date, this.history.active_end_date);
    },
    onStartDateChange: function () {
      flatpickr('#datePicker-end', {
        dateFormat: "Y-m-d",
        minDate: new Date($('#datePicker-start').val()) - 1
      });
    },
    onEndDateChange: function () {
      flatpickr('#datePicker-start', {
        minDate: "today",
        maxDate: new Date($('#datePicker-end').val()) - 1
      });
    },
    signout: function () {
      deleteCookies();
      location.href = '/playback-portal-s3/index.html';
    },
    reqeust_history_select: async function (start_date, end_date) {
      var resp = {};
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.jwt
          //'X-Vault-Token': sessionStorage.getItem('token')
        },
        params: {
          'active_start_date': start_date,
          'active_end_date': end_date
        }
      };
      await axios.get(`${this.host_api}/playback-portal/history`, options)
      .then((response) => {
        let temp = [];
        for (let row of response.data) {          // Update timestamp with add time zone +7
          console.log(row)
          temp.push(row);
        }
        this.results = temp;
      })
      .catch(error => {
        console.log('Error: ', error)
        //validateHTTPResponse(error);
      })
  }
  },
  watch: {
    results: function (val) {
      this.tbl_element.destroy();
      this.$nextTick(() => {
        this.tbl_element = $('#result-datatable').DataTable({
          order: [[0, "desc"]],
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

$(document).ready(function () {
  flatpickr('#datePicker-start', {
    maxDate: new Date().fp_incr(1095)
  });
  flatpickr('#datePicker-end', {
    maxDate: new Date().fp_incr(1095)
  });
});

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

function goToSalesforce(resource_id) {
  console.log(resource_id)
  // เปลี่ยน URL ของหน้าเว็บไซต์เพื่อไปยัง Salesforce โดยใช้ window.location.href
  window.location.href ='https://fwdlifeinsurance--devcti.sandbox.lightning.force.com/lightning/r/VoiceCall/' + resource_id + '/view';
}
