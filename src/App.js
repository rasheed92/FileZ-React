import React, { Component } from "react";
import { BrowserRouter, Route } from "react-router-dom";
import { toaster } from "evergreen-ui";
import axios from "axios";
import Cookies from "universal-cookie";
import openSocket from 'socket.io-client';

import Context from "./component/context.js";
import Trash from "./component/trash";
import Admin from "./component/admin";
import MyFiles from "./component/myFiles";
import Signin from "./component/signin";
import Signup from "./component/signup";
import Home from "./component/home";

import Openfolder from "./assets/images/openfolder.png";
import FolderIcon from "./assets/images/folder.png";

var host="http://localhost:5000/"
var FolderIdCheck;


const cookies = new Cookies();

class App extends Component {
  constructor() {
    super();
    this.state = {
      Session: [],
      isLogin: "",
      // FolderIdCheck: "",
      Packagefree: "",
      packageSize: "",
      Files: [],
      UnFilterFiles: [],
      Folders: [],
      FileNames: "",
      UserLimit: "",
      // search: "",
      Users: [],
      NumberOfUsers: "",
      FilesSizeInfo: "",
      FilesNumber: "",
      TrashFiles: [],
      FoldersPath: [],
      FilesInTrash: ""
    };
  }

  componentDidMount() {
    this.SocketData();

    axios
      .get(host+`api/user/checklogin/`, {
        headers: { token: cookies.get("token") }
      })
      .then(response => {
        // If request is good...
        if (response.data[1]) {
          //calculate limit for
          let packageSize=response.data[1].sesson.packageSize;
          var limit = response.data[1].sesson.limit;
          var free = packageSize - limit;
          var rate = free / packageSize;
          var packagefree = rate * 100;
          this.setState({
            isLogin: response.data[0].auth,
            Session: response.data[1].sesson,
            UserLimit: response.data[1].sesson.limit,
            Packagefree: packagefree,
            PackageSize: packageSize
          });
          this.NetworkRequests();
          if (response.data[1].sesson.role === 1) {
            this.AdmainDataRequests();
          }
        } else {
          console.log(response.data.auth)
          this.setState({
            isLogin: response.data.auth
          });
        }
      })
      .catch(error => {
        console.log("error " + error);
      });
  }
  
  AdmainDataRequests() {
    fetch(host+`api/user/admin/users`, {
      credentials: "same-origin",
      headers: {
        token: cookies.get("token")
      }
    })
      .then(response => {
        if (response.status == 200) {
          return response.json();
        }
      })
      .then(data => {
        if (data) {
          this.setState({
            Users: data,
            NumberOfUsers: data.length
          });
        }
      });
    fetch(host+`api/user/admin/filesinfo`, {
      credentials: "same-origin",
      headers: {
        token: cookies.get("token")
      }
    })
      .then(response => {
        if (response.status == 200) {
          return response.json();
        }
      })
      .then(data => {
        if (data[0]) {
          this.setState({
            FilesSizeInfo: data[0].totalFilesUplodedSize,
            FilesNumber: data[0].totalFiles
          });
        }
      });
  }

  NetworkRequests(FolderIdCheck) {
    if (!FolderIdCheck) {
      axios
        .get(host+`api/files/`, { headers: { token: cookies.get("token") } })
        .then(response => {
          // If request is good...
          if (response.data) {
            this.setState({
              Files: response.data[0].data,
              UnFilterFiles: response.data[0].data
            });
            let fileNames = [];
            for (let i = 0; i < this.state.Files.length; i++) {
              fileNames.push(this.state.Files[i].name);
            }
            this.setState({
              FileNames: fileNames
            });
          }
        })
        .catch(error => {
          console.log("error " + error);
        });
        axios .get(host+`api/folder/`, { headers: { token: cookies.get("token") } })
        .then(response => {
          // If request is good...
          if (response.data) {
            this.setState({
              Folders: response.data
            });
          }
        })
        .catch(error => {
          console.log("error " + error);
        });
    } else {
      axios
        .get(host+`api/folder/folder/` + FolderIdCheck, {
          headers: { token: cookies.get("token") }
        })
        .then(response => {
          // If request is good...
          // console.log(response.data)
          if (response.data) {
            this.setState({
              Files: response.data[1].Files,
              UnFilterFiles: response.data[1].Files,
              Folders:response.data[0].Folder
            });
            FolderIdCheck = "";
            let fileNames = [];
            for (let i = 0; i < this.state.Files.length; i++) {
              fileNames.push(this.state.Files[i].name);
            }
            this.setState({
              FileNames: fileNames
            });
          }
        })
        .catch(error => {
          console.log("error " + error);
        });
    }

   

    axios
      .get(host+`api/files/bin/`, { headers: { token: cookies.get("token") } })
      .then(response => {
        // If request is good...
        if (response.data) {
          this.setState({
            TrashFiles: response.data,
            FilesInTrash: response.data.length
          });
        }
      })
      .catch(error => {
        console.log("error " + error);
      });
  }



  SocketData() {
    var io = openSocket.connect(
      host,
      {
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity
      }
    );
    io.on("disconnect", () => {
      toaster.danger("Server Connection Lost");
    });
    io.on("connect", () => {
      toaster.notify("Real Time Active");
    });
    io.on("reconnect_attempt", attemptNumber => {
      toaster.warning("Attempting To Reconnect To Server "+attemptNumber);
    });

    io.on("AddNewFolder", data => {
      let Folders = [...this.state.Folders, data];
      var uniqueFolders = Folders.reduce((unique, o) => {
        if (!unique.some(obj => obj._id === o._id)) {
          unique.push(o);
        }
        return unique;
      }, []);
      this.setState({
        Folders: uniqueFolders
      });
    });

    io.on("NewFileAdded", data => {
      let Files = [...this.state.Files, data];
      var uniqueFiles = Files.reduce((unique, o) => {
        if (!unique.some(obj => obj._id === o._id)) {
          unique.push(o);
        }
        return unique;
      }, []);

      this.setState({
        Files: uniqueFiles,
        FilesNumber: this.state.FilesNumber + 1,
        FilesSizeInfo: this.state.FilesSizeInfo + data.size
      });
    });

    io.on("NewUser", data => {
      let Users = [...this.state.Users, data];
      var uniqueUsers = Users.reduce((unique, o) => {
        if (!unique.some(obj => obj._id === o._id)) {
          unique.push(o);
        }
        return unique;
      }, []);
      this.setState({
        Users: uniqueUsers
      });
    });

    io.on("userLimitChange", function(userLimitChange) {
      userLimitChangeIO(userLimitChange);
    });
    const userLimitChangeIO = userLimitChange => {
      let packageSize=userLimitChange.packageSize;
      var limit = userLimitChange.limit;
      var free = packageSize - limit;
      var rate = free / packageSize;
      var packagefree = rate * 100;
      this.setState({
        Session: userLimitChange,
        UserLimit: userLimitChange.limit,
        Packagefree: packagefree,
        PackageSize: packageSize
      });
    };
    io.on("DeleteFolder", data => {
      let Folders = this.state.Folders;
      this.setState({
        Folders: Folders.filter(Folders => Folders._id !== data)
      });
    });

    io.on("DeleteUser", data => {
      let Users = this.state.Users;
      this.setState({
        Users: Users.filter(Users => Users._id !== data),
        NumberOfUsers: this.state.NumberOfUsers - 1
      });
    });

    io.on("MoveFileToFolder", data => {
      let Files = this.state.Files;
      this.setState({
        Files: Files.filter(Files => Files._id !== data)
      });
    });

    io.on("MoveFileToTrash", data => {
      let TrashFiles = [...this.state.TrashFiles, data];
      let Files = this.state.Files;
      var uniqueTrashFiles = TrashFiles.reduce((unique, o) => {
        if (!unique.some(obj => obj._id === o._id)) {
          unique.push(o);
        }
        return unique;
      }, []);
      this.setState({
        Files: Files.filter(Files => Files._id !== data._id),
        TrashFiles: uniqueTrashFiles,
        FilesInTrash:this.state.FilesInTrash+1
      });
    });

    io.on("UpdateUserProfile", data => {
      this.setState({
        Session: data
      });
    });

    io.on("RecoveryFileFromTrash", data => {
      let Files = [...this.state.Files, data];
      let TrashFiles = this.state.TrashFiles;
      var uniqueFiles = Files.reduce((unique, o) => {
        if (!unique.some(obj => obj._id === o._id)) {
          unique.push(o);
        }
        return unique;
      }, []);
      this.setState({
        TrashFiles: TrashFiles.filter(Files => Files._id !== data._id),
        Files: uniqueFiles,
        FilesInTrash:this.state.FilesInTrash-1
      });
    });
    io.on("DeletedFile", data => {
      let TrashFiles = this.state.TrashFiles;
      this.setState({
        TrashFiles: TrashFiles.filter(Files => Files._id !== data._id),
        FilesNumber: this.state.FilesNumber - 1,
        FilesSizeInfo: this.state.FilesSizeInfo - data.size,
        FilesInTrash:this.state.FilesInTrash-1
      });
    });
  }

  render() {
    return (
      <BrowserRouter>
        <Context.Provider
          value={{
            value: this.state,
            actions: {
              //this function use to MoveFileTOTrash
              MoveFileTOTrash: value => {
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };

                axios({
                  url: host+`api/files/bin/add/` + value,
                  method: "POST",
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success(
                        "File has been moved to trash successfully"
                      );
                      if (FolderIdCheck) {
                        this.NetworkRequests(FolderIdCheck);
                      } else {
                        this.NetworkRequests();
                      }
                    }
                  })
                  .catch(function(error) {
                    console.log(error.request);
                    console.log(error.config);
                  });
              },
              MoveFileTOFolder: (file_id, folder_id) => {
                let formData = new FormData();
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };
                formData.append("folder", folder_id);

                axios({
                  url: host+`api/files/move/` + file_id,
                  method: "POST",
                  data: formData,
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success("File has been moved Successfully");
                      if (FolderIdCheck) {
                        this.NetworkRequests(FolderIdCheck);
                      } else {
                        this.NetworkRequests();
                      }
                    }
                  })
                  .catch(function(error) {
                    console.log(error.request);
                    console.log(error.config);
                  });
              },
              OpenFolder: value => {
                FolderIdCheck = value;
                this.NetworkRequests(FolderIdCheck);
              },
              CloseFolder: value => {

                FolderIdCheck = "";
                this.NetworkRequests(FolderIdCheck);
              },
              filterTrash: value => {
                //sort by name
                if (value == "Name") {
                  let sort = this.state.TrashFiles;
                  sort.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                  });
                  this.setState({
                    TrashFiles: sort
                  });
                  //sort size
                } else if (value == "Size") {
                  let sort = this.state.TrashFiles;
                  sort.sort(function(a, b) {
                    var fileA = a.size;
                    var fileb = b.size;
                    return fileA > fileb ? -1 : fileA < fileb ? 1 : 0;
                  });
                  this.setState({
                    TrashFiles: sort
                  });
                }
              },
              filterFiles: value => {
                //sort by name
                if (value == "Name") {
                  let sort = this.state.Files;
                  sort.sort(function(a, b) {
                    return a.name.localeCompare(b.name);
                  });
                  this.setState({
                    Files: sort
                  });
                  //sort size
                } else if (value == "Size") {
                  let sort = this.state.Files;
                  sort.sort(function(a, b) {
                    var fileA = a.size;
                    var fileb = b.size;
                    return fileA > fileb ? -1 : fileA < fileb ? 1 : 0;
                  });
                  this.setState({
                    Files: sort
                  });
                  //filter by images
                } else if (value == "images") {
                  let sort = this.state.Files;
                  const result = sort.filter(sort => sort.type == "image");
                  this.setState({
                    Files: result
                  });
                  //filter by PDF
                } else if (value == "PDF") {
                  let sort = this.state.Files;
                  const result = sort.filter(
                    sort => sort.type == "application/pdf"
                  );
                  this.setState({
                    Files: result
                  });
                  //filter by Videos
                } else if (value == "Videos") {
                  let sort = this.state.Files;
                  const result = sort.filter(sort => sort.type == "video");
                  this.setState({
                    Files: result
                  });
                  // filter other type
                } else if (value == "other_Files") {
                  let sort = this.state.Files;
                  const result = sort.filter(
                    sort =>
                      sort.type != "image" &&
                      sort.type != "application/pdf" &&
                      sort.type != "video"
                  );
                  this.setState({
                    Files: result
                  });
                } else if (value == "all") {
                  let all = this.state.UnFilterFiles;
                  this.setState({
                    Files: all
                  });
                } else {
                  let sort = this.state.Files;
                  let obj = [sort.find(o => o.name === value)];
                  this.setState({
                    Files: obj
                  });
                  console.log(value);
                }
              },
              MyFilesClicked: value => {
                this.componentDidMount();

                // this.componentDidMount();
              },
              test: value => {
               this.NetworkRequests(value)

                // this.componentDidMount();
              },
              ReCallcomponentDidMount: value => {
                this.componentDidMount();
              },
              UpgradedPackage: (token,Package) => {

                let formData = new FormData();
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };

                formData.append("stripeToken", token.id);
                formData.append("package", Package);
                axios({
                  url: host+`api/user/updatePackage/`,
                  method: "POST",
                  data: formData,
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success(response.data);
                      this.NetworkRequests();
                    }
                  })
                  .catch(function(error) {
                    if (error.request.response) {
                      toaster.danger(error.request.response);
                    }
                  });
              },
              DeleteFodler: value => {
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };
                axios({
                  url: host+`api/folder/` + value,
                  method: "Delete",
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success("Folder has been Deleted successfully");
                      document.getElementById("deleteFolder").style.display =
                        "none";
                      document.getElementById("undoFolder").style.display =
                        "none";
                      this.componentDidMount();
                    }
                  })
                  .catch(function(error) {
                    if (error) {
                      if (error.request) {
                        toaster.warning(error.request.response);
                      }
                    }
                  });
              },
              AddNewFolder: (FolderName,FolderID) => {
                let formData = new FormData();
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };
                formData.append("name", FolderName);
                if (FolderID) {
                  formData.append("folder", FolderID);
                }
                axios({
                  url: host+`api/folder/add`,
                  method: "POST",
                  data: formData,
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success("Folder has been added successfully");
                      this.NetworkRequests(FolderID);
                    }
                  })
                  .catch(function(error) {
                    if (error.request.response) {
                      toaster.danger(error.request.response);
                    }
                  });
              },
              AddAdmin: (AdminName, AdminEmail, AdminPassword) => {
                let formData = new FormData();
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };
                formData.append("name", AdminName);
                formData.append("email", AdminEmail);
                formData.append("password", AdminPassword);

                axios({
                  url: host+`api/user/admin/add`,
                  method: "POST",
                  data: formData,
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success("Admin has been added successfully");
                      this.componentDidMount();
                    }
                  })
                  .catch(function(error) {
                    if (error.response.data.code == 11000) {
                      toaster.danger("The email is already in use");
                    } else if (error.response.data.details[0].message) {
                      toaster.danger(error.response.data.details[0].message);
                    } else {
                      toaster.danger("Sorry you are not an admin");
                    }
                    console.log(error);
                  });
              },
              deleteUser: value => {
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };

                axios({
                  url: host+`api/user/admin/deleteUser/` + value,
                  method: "delete",
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success("User has been Deleted successfully");
                      this.componentDidMount();
                    }
                  })
                  .catch(function(error) {
                    console.log(error.request);
                    console.log(error.config);
                  });
              },
              UserPorfileEdit: (UserName, ProfilePicture) => {
                let formData = new FormData();
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };
                formData.append("name", UserName);
                formData.append("file", ProfilePicture);
                axios({
                  url: host+`api/user/update/`,
                  method: "POST",
                  data: formData,
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success("Your profile has been updated successfully");
                      this.componentDidMount();
                    }
                  })
                  .catch(function(error) {
                    if (error.request.response) {
                      toaster.danger(error.request.response);
                    }
                    console.log(error);
                  });
              },
              RecoveryFromTrash: value => {
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };
                axios({
                  url: host+`api/files/bin/` + value,
                  method: "POST",
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success("File has been recovered successfully");
                      this.NetworkRequests();
                    }
                  })
                  .catch(function(error) {
                    console.log(error.request);
                    console.log(error.config);
                  });
              },
              DeleteFile: value => {
                var headers = {
                  "Content-Type": "application/json",
                  token: cookies.get("token")
                };
                axios({
                  url: host+`api/files/bin/` + value,
                  method: "delete",
                  headers: headers
                })
                  .then(response => {
                    if (response.status == 200) {
                      toaster.success("File has been deleted successfully");
                      this.componentDidMount();
                    }
                  })
                  .catch(function(error) {
                    console.log(error.request);
                    console.log(error.config);
                  });
              }
            }
          }}
        >
          <Route exact path="/" component={Home} />
          <Route exact path="/files" component={MyFiles} />
          <Route exact path="/trash" component={Trash} />
          <Route exact path="/admin" component={Admin} />
          <Route exact path="/signup" component={Signup} />
          <Route exact path="/signin" component={Signin} />
        </Context.Provider>
      </BrowserRouter>
    );
  }
}

export default App;