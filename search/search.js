var app = new Vue({ 
  el: '#app',
  data: {
    host_api: "https://v6brfm2vjc.execute-api.ap-southeast-1.amazonaws.com/default",
    jwt: "",
    jwt_json: {},
    cache: {},
    method: "",
    results: [],
    tbl_element: "",
    nav: {
      displayName: ""
    },
    user_role:"",
    form: {
      remove_keyword: "",
    },
    search: {
      id: "",
      fromphonenumber: "",
      callstartdatetime: "",
      callenddatetime: "",
      queuename: 0,
      voicepath: "",
      status: 0
    },
    profile_list: {},
    sf_search_list: {},
    search_list: [],
    load_data_complete: false,
    confirmation: '',
    audioVisible: false,
  },
  async mounted() {
    this.user_role = "admin"; 
    if (sessionStorage.getItem('jwt')) {
      this.jwt = sessionStorage.getItem('jwt');
    }
    this.nav.displayName = this.jwt.name;
    this.tbl_element = $('#result-datatable').DataTable();
    this.load_data_complete = true;
  },
  
  methods: {
    load_search_detail: function (data) {
      this.method = "Update";
      this.search.id = data.id;
      this.search.fromphonenumber = data.fromphonenumber;
      this.search.callstartdatetime = data.callstartdatetime;
      this.search.callenddatetime = data.callenddatetime;
      this.search.queuename = data.queuename;
      this.search.voicepath = data.voicepath;

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
      this.search.active_start_date = $('#datePicker-start').val();
      this.search.active_end_date = $('#datePicker-end').val();
      $('#formModal').modal('hide');
      await this.reqeust_search_selectAll(this.search.active_start_date, this.search.active_end_date);
    },
    remove_voiceDetail: async function (id) {
      this.search.status = -1;
      await this.reqeust_search_remove(id);
      $('#exampleModalCenter').modal('hide');
      await this.reqeust_search_selectAll(this.search.active_start_date, this.search.active_end_date);
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
    async reqeust_search_selectAll(start_date, end_date) {
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.jwt
        },
        params: {
          'active_start_date': start_date,
          'active_end_date': end_date
        }
      };
      await axios.get(`${this.host_api}/playback-portal/search`, options)
        .then((response) => {
          
          let temp = [];
          
          for (let row of response.data) {
            console.log(row)
            temp.push(row);
          }
          this.results = temp; // Set results value to the temp variable
        })
        .catch(error => {
          console.log('Error: ', error)
          //validateHTTPResponse(error);
        })
        //return resp;
    },
    
    async showAudio(id) {
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.jwt
        }
      };   
      $player = $('#myAudio');
      /*fetch(`${this.host_api}/playback-portal/search/voice?id=${id}`, options)
        .then(response => response.json())
        .then(result => {
          console.log(result);
          //let results = result.replace(/\\/g, '');
          //voice = JSON.parse(results);
          //console.log(voice);

          if (result.base64) {
            let src = `data:audio/wav;base64,${result.base64}`
            $player.attr('src', src);
            $('#playback-btn-' + rowdata.contactId).button('reset');
            $player.show();
            $player.trigger("play");
          }
          else {
            this.change_button_not_found(rowdata);
          }
        })
        .catch(error => {
          console.error(error)
          this.change_button_not_found(rowdata);
        });
},*/
      fetch(`${this.host_api}/playback-portal/search/voice?id=${id}`, options)
        .then(response => response.arrayBuffer())
        .then(arrayBuffer => { 
          if (arrayBuffer !== undefined && arrayBuffer !== "") {
            let audioUrl = URL.createObjectURL(new Blob([arrayBuffer],{type: 'audio/wav'}));
            console.log(audioUrl);
            $player.attr('src', 'https://fwd-playback-portal.s3.ap-southeast-1.amazonaws.com/playback-portal-s3/voice/Greeting.wav');
            $player.show();
            $player.trigger("play");
          }
        })  
        .catch(error => {
          console.log('Error: ', error)
          //validateHTTPResponse(error);
        });
},


      /*fetch(`${this.host_api}/playback-portal/search/voice?id=${id}`, options)
              .then(response => response.json())
              .then(result => { 
                if (result.base64) {
                  let src = `data:audio/wav;base64,${result.base64}`
                  $player.attr('src', src);
                  $player.show();
                  $player.trigger("play");
                }
              })  
              .catch(error => {
                console.log('Error: ', error)
                //validateHTTPResponse(error);
              });
      },*/






    reqeust_search_remove: async function (id) {
      var resp = {};
      let options = {
        headers: {
          'Content-Type': 'application/json',
          'Authorization': this.jwt
        }
      };
      await axios.delete(`${this.host_api}/playback-portal/search/delete?id=${id}`, options)
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

function deleteCookies() {
  var cookies = document.cookie.split(";");

  for (var i = 0; i < cookies.length; i++) {
    var cookie = cookies[i];
    var eqPos = cookie.indexOf("=");
    var name = eqPos > -1 ? cookie.substr(0, eqPos) : cookie;
    document.cookie = name + "=;expires=Thu, 01 Jan 1970 00:00:00 GMT;path=/playback-portal";
  }
}

function convertTime(data) {
  let time_split = data.split(':');
  if (time_split[0].length === 1) {
    time_split[0] = '0' + time_split[0];
  }
  return time_split[0] + ":" + time_split[1];
}

function goToSalesforce(id) {
  // เปลี่ยน URL ของหน้าเว็บไซต์เพื่อไปยัง Salesforce โดยใช้ window.location.href
  window.location.href ='https://fwdlifeinsurance--devcti.sandbox.lightning.force.com/lightning/r/VoiceCall/' + id + '/view';
}
