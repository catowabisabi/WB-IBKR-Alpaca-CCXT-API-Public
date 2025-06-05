import { Injectable } from '@nestjs/common';
import ftWebsocket from 'futu-api';
import { Common } from 'futu-api/proto';
import beautify from 'js-beautify';

@Injectable()
export class FutuService {
  private websocket: any;
  private addr = '127.0.0.1';
  private port = 33333;
  private enable_ssl = false;
  private key = '50dca1d6ce8d2fae';

  constructor() {
    this.websocket = new ftWebsocket();
    this.websocket.onlogin = this.onLogin.bind(this);
  }

  private onLogin(ret: boolean, msg: string) {
    if (ret) {
      const req = {
        c2s: {
          userID: 0,  // 根据文档，userID填0即可
        },
      };
      this.websocket.GetAccList(req)
        .then((res: any) => {
          let { errCode, retMsg, retType, s2c } = res;
          console.log("AccList: errCode %d, retMsg %s, retType %d", errCode, retMsg, retType);
          if (retType === Common.RetType.RetType_Succeed) {
            let data = beautify(JSON.stringify(s2c), {
              indent_size: 2,
              space_in_empty_paren: true,
            });
            console.log(data);
          }
        })
        .catch((error: any) => {
          console.error("error:", error);
        });
    } else {
      console.error("Login error:", msg);
    }
  }

  public connectAndFetch() {
    this.websocket.start(this.addr, this.port, this.enable_ssl, this.key);

    setTimeout(() => { 
      this.websocket.stop();
      console.log("Connection stopped");
    }, 5000); // 5秒后断开连接
  }
}
