import { ArrowRightOutlined } from '@ant-design/icons';
import { Alert, Checkbox, Row, Col, Form, Input, Button } from 'antd';
import React, { useState } from 'react';
import { Link, connect } from 'umi';
import styles from './style.less';

import loginBg from '@/assets/loginbg.jpg';

const LoginMessage = ({ content }) => (
  <Alert
    style={{
      marginBottom: 24,
    }}
    message={content}
    type="error"
    showIcon
  />
);

const Login = props => {
  const { userLogin = {}, submitting } = props;
  const { status, type: loginType } = userLogin;
  const [autoLogin, setAutoLogin] = useState(true);
  const [type, setType] = useState('account');

  const handleSubmit = values => {
    const { dispatch } = props;
    dispatch({
      type: 'login/login',
      payload: { ...values, app: 'yocloud' },
    });
  };

  const loginFailed = () => {
    console.log('提交失败');
  }

  return (
    <div className={styles.main}>
      <Row>
        <Col span={12}>
          <div className={styles.loginBg}>
            <img src={loginBg} />
          </div>
        </Col>
        <Col span={12}>
          <div className={styles.loginWrapper}>
            <Form
              onFinish={handleSubmit}
              onFinishFailed={loginFailed}
              className={styles.loginForm}
            >
              <div className={styles.title}>
                <h1>登录 <span><ArrowRightOutlined style={{color: '#eeeeee', fontSize: '12px', borderRadius: '50%', border: '1px solid #eeeeee', padding: '2px'}} /></span></h1>
                <p>优云私有化产品管理系统</p>
              </div>
              <Form.Item label="账号：" name="id">
                <Input placeholder="请输入用户名称" />
              </Form.Item>
              <Form.Item label="密码：" name="password">
                <Input.Password placeholder="请输入登录密码" />
              </Form.Item>
              <Button type="primary" htmlType="submit" className={styles.btn}>登录</Button>
            </Form>
            <p style={{ textAlign: 'center', marginTop: '100px' }}>当前版本 V1.0</p>
          </div>
        </Col>
      </Row>



    </div>
  );
};

export default connect(({ login, loading }) => ({
  userLogin: login,
  submitting: loading.effects['login/login'],
}))(Login);
