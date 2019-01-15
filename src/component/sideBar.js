import React from "react";
import Context from "./context.js";
import {
  Popover,
  Position,
  Menu,
  Button,
  Pane,
  Dialog,
  toaster,
  IconButton,
  FilePicker,
  Heading,
  Select,
  Switch,
  TextInput,
  Alert
} from "evergreen-ui";
import Component from "@reactions/component";
import { NavLink } from "react-router-dom";
import { Line, Circle } from "rc-progress";
import FileUploadProgress from "react-fileupload-progress";
import UploadProgress, { UploadStatus } from "react-upload-progress";
import Dropzone from "react-dropzone";
import axios from "axios";
import Cookies from "universal-cookie";
import { Row ,Col } from 'react-bootstrap';
var UploadCheck = 0;

const cookies = new Cookies();

var CheckFile;
var Toggle = false;
var AdminPassword ='';
var AdminName ='';
var AdminEmail ='';
var FolderName = "";
var ProfilePicture;
var UserName= "";

const styles = {
  progressWrapper: {
    height: "27px",
    marginTop: "4px",
    marginLeft: "20px",
    width: "475px",
    float: "left",
    overflow: "hidden",
    backgroundColor: "#f5f5f5",
    borderRadius: "4px",
    WebkitBoxShadow: "inset 0 1px 2px rgba(0,0,0,.1)",
    boxShadow: "inset 0 1px 2px rgba(0,0,0,.1)"
  },
  progressBar: {
    float: "left",
    width: "0",
    height: "100%",
    fontSize: "12px",
    lineHeight: "20px",
    color: "#fff",
    textAlign: "center",
    backgroundColor: "#5cb85c",
    WebkitBoxShadow: "inset 0 -1px 0 rgba(0,0,0,.15)",
    boxShadow: "inset 0 -1px 0 rgba(0,0,0,.15)",
    WebkitTransition: "width .6s ease",
    Otransition: "width .6s ease",
    transition: "width .6s ease"
  },
  cancelButton: {
    marginTop: "5px",
    WebkitAppearance: "none",
    padding: 0,
    cursor: "pointer",
    background: "0 0",
    border: 0,
    float: "left",
    fontSize: "21px",
    fontWeight: 700,
    lineHeight: 1,
    color: "#000",
    textShadow: "0 1px 0 #fff",
    filter: "alpha(opacity=20)",
    opacity: ".2"
  },

  bslabel: {
    display: "inline-block",
    maxWidth: "100%",
    marginBottom: "5px",
    fontWeight: 700
  },

  bsHelp: {
    display: "block",
    marginTop: "5px",
    marginBottom: "10px",
    color: "#737373"
  },

  bsButton: {
    padding: "1px 5px",
    fontSize: "12px",
    lineHeight: "1.5",
    borderRadius: "3px",
    color: "#fff",
    backgroundColor: "#337ab7",
    borderColor: "#2e6da4",
    display: "inline-block",
    padding: "6px 12px",
    marginBottom: 0,
    fontWeight: 400,
    textAlign: "center",
    whiteSpace: "nowrap",
    verticalAlign: "middle",
    touchAction: "manipulation",
    cursor: "pointer",
    WebkitUserSelect: "none",
    MozUserSelect: "none",
    msUserSelect: "none",
    userSelect: "none",
    backgroundImage: "none",
    border: "1px solid transparent"
  }
};

class SideBar extends React.Component {
  constructor() {
    super();
    this.state = {
      percent: 0,
      Folders: []
    };
  }

  componentDidMount() {
    fetch(`/api/folder/`, {
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
            Folders: data
          });
        }
      });
  }
  formGetter() {
    return new FormData(document.getElementById("customForm"));
  }
  customProgressRenderer(progress, hasError, cancelHandler) {
    if (hasError || progress > -1) {
      let barStyle = Object.assign({}, styles.progressBar);

      barStyle.width = progress + "%";

      let message = (
        <span style={{ "margin-left": "19px" }}>
          Uploading {barStyle.width}
        </span>
      );
      if (hasError) {
        barStyle.backgroundColor = "#d9534f";
        message = (
          <span style={{ color: "#a94442", "margin-left": "19px" }}>
            Failed to upload ...
          </span>
        );
      }
      if (progress === 100) {
        // message = (
        //   <span
        //     style={{
        //       color: "#0884d9",
        //       "margin-left": "224px",
        //       "font-weight": "600"
        //     }}
        //   >
        //     Done
        //   </span>
        // );
      }

      return (
        <div>
          <div style={styles.progressWrapper}>
            <div style={barStyle} />
          </div>
          <IconButton onClick={cancelHandler} icon="cross" intent="danger" />
          <div style={{ clear: "left" }}>{message}</div>
        </div>
      );
    } else {
      return;
    }
  }
  customFormRenderer(onSubmit) {
    return (
      <form
      id="customForm"
      method="post"
      action="/api/files/add"
      // style={{ marginBottom: "15px" }}
>
                  <Heading size={400}  marginLeft={32}  marginBottom={10} >Select Folder</Heading>
                 
                  <Select
                  name='folder'
                   width="90%" 
                  marginBottom={10}
                  marginLeft={32}
                    >
                    <option   checked>Main Folder</option>
                      {
                  this.state.Folders.map((Folder, i) => (
                     <option  key={Folder._id} value={Folder._id} >{Folder.name}</option>
                      ))}
                      </Select>
                      <input type='hidden' name="token" value={cookies.get('token')}  />
                      <input type='hidden' name="public" value={1}  />
                      <Heading size={400} marginLeft={32}    width="90%" marginBottom={10} marginTop="default">Choose File</Heading>
      
          <FilePicker
            marginLeft={32}  
            width="90%" marginBottom={10} 
            onChange={files => console.log(files)}
            display= "none;"
              name='file'
            />
                      <Heading size={400} marginLeft={32} marginBottom={10} marginTop="default">Private ?</Heading>
                      <Switch marginLeft={32} name="public" value={1} marginBottom={10} disabled />  
                      <Button appearance="primary" marginLeft={200} onClick={onSubmit} >Upload File</Button>   


      {/* <button type="submit"  onClick={onSubmit}>Upload</button> */}
    </form>
      );
  }

  AddNewFolder() {
    let formData = new FormData();
    var headers = {
      "Content-Type": "application/json",
      token: cookies.get("token")
    };

    formData.append("name", FolderName);
    axios({
      url: `/api/folder/add`,
      method: "POST",
      data: formData,
      headers: headers
    })
      .then(function(response) {
        if (response.status == 200) {
          toaster.success("Folder has been added successfully");

          setTimeout(function() {
            // window.location.href = '/'
          }, 500);
        }
      })
      .catch(function(error) {
        console.log(error.request);

        // if (error.response.data.details[0].message) {
        //     toaster.danger(
        //         error.response.data.details[0].message
        //     )
        // } else if (error.request) {
        //     console.log(error.request);
        // } else {

        //     console.log('Error', error.message);
        // }
        console.log(error.config);
      });
    // this.componentDidMount()
    console.log("value");
  }



  AddAdmin(){
    let formData = new FormData();
    var headers = {
      "Content-Type": "application/json",
      token: cookies.get("token")
    };

    formData.append("name", AdminName);
    formData.append("email", AdminEmail);
    formData.append("password", AdminPassword);
    axios({
      url: `/api/user/admin/add`,
      method: "POST",
      data: formData,
      headers: headers
    })
      .then(function(response) {
        if (response.status == 200) {

          toaster.success("Admin has been added successfully");


        }
      })
      .catch(function (error) {
        console.log(error.request.response);
        if (error.response.data.code==11000) {
            toaster.danger('The email is already in use')
    } else if ( error.response.data.details[0].message) {
      toaster.danger(
        error.response.data.details[0].message
      )
    } else {
      toaster.danger(
        'Sorry you are not A Admin'
      )
      
    }

        console.log(error);

      });
      this.componentDidMount()

  }

  UserPorfileEdit(){
    let formData = new FormData();
    var headers = {
      "Content-Type": "application/json",
      token: cookies.get("token")
    };

    formData.append("name", UserName);
    formData.append("file", ProfilePicture);
    axios({
      url: `api/user/update/`,
      method: "POST",
      data: formData,
      headers: headers
    })
      .then(function(response) {
        if (response.status == 200) {

          toaster.success("update successfully");


        }
      })
      .catch(function (error) {
        console.log(error.request.response);

        console.log(error);

      });
      this.componentDidMount()

  }
  render() {
    return (
      <Context.Consumer>
        {ctx => {
          return (
            <React.Fragment>
<div>
  <Row className="show-grid" style={{marginRight: 0 + 'px'}}>
  <Col  xs={12} sm={12}  md={3}  >
 
      
  <div className="leftcomponent"  >
                  <div className="logo">
                    <img src="/assets/images/cloud.png" alt="" />
                    <p>FileZ</p>
                  </div>


                  <div className="myfiles">
                    <NavLink className="myfile" exact to="/files">
                      <img src="/assets/images/folder4.png" alt="" />
                      <a>My File</a>
                    </NavLink>
                  </div>

                  <div className="bins">
                    <NavLink
                      activeClassName="actbin"
                      className="bin"
                      to="/Trash"
                    >
                      <img src="/assets/images/bin.png"  alt="" />
                      <a href="#2">Trash</a>
                    </NavLink>
                  </div>
                  <div className="admins"  style={ctx.value.Session.role == 1 ? { } : {display: 'none' }}>
                    <NavLink className="admin" to="/admin">
                      <img
                        
                        src="/assets/images/admin.png"
                        alt=""
                      />
                      <a href="#3">Admin</a>
                    </NavLink>
                  </div>
                  <br />
                  {/* <Menu.Divider /> */}
                  <Component   initialState={{ isShown: false }}>
                    {({ state, setState }) => (
                      <Pane marginTop={-25} className="pane-container">
                        <Dialog
                          isShown={state.isShown}
                          onConfirm={() => {}}
                          title="Upload New File"
                          hasFooter={false}
                          onCloseComplete={() => {
                            setState({ isShown: false });
                          }}
                          confirmLabel="Upload File"
                        >
                          <FileUploadProgress
                            key="ex2"
                            url="/api/files/add"
                            onProgress={(e, request, progress) => {
                              UploadCheck = progress;
                              console.log(UploadCheck);
                              if (progress == 100) {
                                console.log("progress", e, request, progress);
                              }
                            }}
                            onLoad={(e, request) => {
                              if (e.currentTarget.response) {
                                toaster.success(e.currentTarget.response);
                                this.componentDidMount();
                              }

                              console.log("load", e.currentTarget.response);
                            }}
                            onError={(e, request) => {
                              if (e.currentTarget.response) {
                                toaster.danger(e.currentTarget.response);
                              }
                              console.log(
                                "error",
                                e.currentTarget.response,
                                request
                              );
                            }}
                            onAbort={(e, request) => {
                              console.log("abort", e, request);
                            }}
                            formGetter={this.formGetter.bind(this)}
                            formRenderer={this.customFormRenderer.bind(this)}
                            progressRenderer={this.customProgressRenderer.bind(
                              this
                            )}
                          />
                        </Dialog>
                        <Menu.Item
                          class="fas fa-file-upload fas-icon"
                          id="addFileIcon"
                          onClick={() => setState({ isShown: true })}
                        >
                          <span className="leftcomponent-link">Add File</span>
                          
                        </Menu.Item>
                      </Pane>
                    )}
                  </Component>

                  <br />
                  
                  {/* <Menu.Divider /> */}
                  <Component initialState={{ isShown: false }}>
                    {({ state, setState }) => (
                      <Pane marginTop={-25} className="pane-container">
                        <Dialog
                          isShown={state.isShown}
                          onConfirm={() => {
                            this.AddNewFolder();
                            setState({ isShown: false });
                          }}
                          title="Add New Folder"
                          onCloseComplete={() => setState({ isShown: false })}
                          confirmLabel="Add"
                        >
                          <Heading size={400} marginLeft={32} marginBottom={10}>
                            Choose Folder Name
                          </Heading>
                          <TextInput
                            onChange={event => {
                              FolderName = event.target.value;
                            }}
                            width="90%"
                            marginLeft={32}
                            marginBottom={10}
                            placeholder="Folder Name..."
                          />
                        </Dialog>
                        <Menu.Item
                          class="fas fa-folder-plus fas-icon2"
                          id="addFolderIcon"
                          onClick={() => setState({ isShown: true })}
                        >
                          
                          <span className="leftcomponent-link2">Add Folder</span>
                        </Menu.Item>
                      </Pane>
                    )}
                  </Component>
                  <br />
                  {/* <Menu.Divider /> */}
                  <Component  initialState={{ isShown: false }}>
                    {({ state, setState }) => (
                      <Pane marginTop={-25} className="pane-container">
                        <Dialog
                          isShown={state.isShown}
                          onConfirm={() => {
                            this.UserPorfileEdit();
                            setState({ isShown: false });
                          }}
                          title="Edit Porfile"
                          onCloseComplete={() => setState({ isShown: false })}
                          confirmLabel="Edit"
                        >
                          <Heading size={400} marginLeft={32} marginBottom={10}>
                             Name
                          </Heading>
                          <TextInput
                            onChange={event => {
                              UserName = event.target.value;
                            }}
                            width="90%"
                            marginLeft={32}
                            marginBottom={10}
                            placeholder=" Name..."
                          />
                          <Heading size={400} marginLeft={32} marginBottom={10}>
                          Select profile picture
                          </Heading>
                          <FilePicker
                            multiple
                            width="90%"
                            marginLeft={32}
                            marginBottom={10}
                            onChange={(files) =>{
                               ProfilePicture=files[0]
                            }}
                          />
                        </Dialog>
                        <Menu.Item
                          class="fas fa-user-edit fas-icon3"
                          id="addFolderIcon"
                          onClick={() => setState({ isShown: true })}
                        >
                          
                          <span className="leftcomponent-link3">Edit Profile</span>
                        </Menu.Item>
                      </Pane>
                    )}
                  </Component>
                  <br />

                  <div  style={ctx.value.Session.role == 1 ? { } : {display: 'none' }}>
                  {/* <Menu.Divider  /> */}
                  

                  <Component initialState={{ isShown: false }}>
                    {({ state, setState }) => (
                      <Pane marginTop={-25} className="pane-container">
                        <Dialog
                          isShown={state.isShown}
                          onConfirm={() => {
                            this.AddAdmin();
                            setState({ isShown: false });
                          }}
                          title="Add New Admin"
                          onCloseComplete={() => setState({ isShown: false })}
                          confirmLabel="Add"
                        >
                          <Heading size={400} marginLeft={32} marginBottom={10}>
                            Name
                          </Heading>
                          <TextInput
                            onChange={event => {
                              AdminName = event.target.value;
                            }}
                            width="90%"
                            marginLeft={32}
                            marginBottom={10}
                            placeholder=" Name..."
                          />
                           <Heading size={400} marginLeft={32} marginBottom={10}>
                           Email
                          </Heading>
                          <TextInput
                            onChange={event => {
                              AdminEmail = event.target.value;
                            }}
                            width="90%"
                            marginLeft={32}
                            marginBottom={10}
                            placeholder="Email..."
                          />
                           <Heading size={400} marginLeft={32} marginBottom={10}>
                           Password
                          </Heading>
                          <TextInput
                            onChange={event => {
                              AdminPassword = event.target.value;
                            }}
                            width="90%"
                            type="password"
                            marginLeft={32}
                            marginBottom={10}
                            placeholder="Password..."
                          />
                        </Dialog>
                        <Menu.Item
                          class="fas fa-user-plus fas-icon4"
                          
                          id="addFolderIcon"
                          style={ctx.value.Session.role == 1 ? { } : {display: 'none' }}
                          onClick={() => setState({ isShown: true })}
                        >
                          
                          <span className="leftcomponent-link4">Add Admin</span>
                        </Menu.Item>
                      </Pane>
                    )}
                  </Component>
                  <br />
                
                  </div>
                  <Menu.Divider />
                  <div className="sorage">
                    <div className="storimg">
                      <img src="/assets/images/storage.png" alt="" />
                      <p>Storage</p>
                    </div>
                    <Line
                      className="szlider"
                      percent={ctx.value.Packagefree}
                      strokeWidth="4"
                      strokeColor="#427fed"
                    />
                    <div className="storparg">
                      <p id="Pstorparg">
                        {(100 - ctx.value.Session.limit / 1000000).toFixed(2)}{" "}
                        MB of {ctx.value.PackageSize / 1000000} MB used
                      </p>
                    </div>
                  </div>
                </div>
                      

    </Col>

  </Row>
  </div>
              </React.Fragment>
          );
        }}
      </Context.Consumer>
    );
  }
}
export default SideBar;