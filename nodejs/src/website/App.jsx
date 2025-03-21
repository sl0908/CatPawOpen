import React, {useEffect} from 'react';
import { createRoot } from 'react-dom/client';
import {Button, Card, Form, Input, Tabs, message, Divider, Space, InputNumber, Row, Col, Switch} from 'antd';
import axios from 'axios'
import copy from 'copy-to-clipboard';
import { MinusCircleOutlined, PlusOutlined } from '@ant-design/icons';
import './App.less'
import refreshImg from './assets/qrcode_refresh.jpg'

const { TabPane } = Tabs;

const http = axios.create({
  baseURL: '/website',
})

http.interceptors.response.use(function (response) {
  if (response.data.code !== 0) {
    message.error(response.data.message);
    throw new Error(response.data);
  } else {
    return response.data.data;
  }
}, function (error) {
  return Promise.reject(error);
});

message.config({
  top: '40%',
});

function QrcodeImage({src}) {
  const [inited, setInited] = React.useState(false);
  return (
    <img src={inited ? src : refreshImg} onClick={() => setInited(true)}/>
  )
}

function QrcodeCard({qrcodeUrl, cacheUrl}) {
  const [data, setData] = React.useState('');

  const generateData = async () => {
    const data = await http.post(cacheUrl)
    setData(data)
  }

  const storeData = async () => {
    await http.put(cacheUrl, {
      cookie: data,
    })
    message.success('入库成功')
  }

  const copyText = (text) => {
    copy(text)
    message.success('复制成功')
  }

  useEffect(() => {
    http.get(cacheUrl)
      .then(data => {
        setData(data);
      })
  }, [])

  return (
    <div className={'qrcodeCard'}>
      <QrcodeImage src={qrcodeUrl}/>
      <Divider>
        <Button onClick={generateData}>扫码后点我</Button>
      </Divider>
      <Input.TextArea value={data} onChange={e => setData(e.target.value)} rows={4}/>
      <div className={'btns'}>
        <Button onClick={() => copyText(data)} disabled={!data} color="cyan" variant="solid"
                style={{marginRight: 24}} size={'large'}>复制</Button>
        <Button onClick={storeData} disabled={!data} type={'primary'} size={'large'}>入库</Button>
      </div>
    </div>
  )
}

function AliQrcodeCard() {
  const [data, setData] = React.useState({
    token: '',
    token280: ''
  });
  const cacheUrl = '/ali/token'

  const generateData = async () => {
    const data = await http.post(cacheUrl)
    setData(data)
  }

  const storeData = async () => {
    await http.put(cacheUrl, {
      data,
    })
    message.success('入库成功')
  }

  useEffect(() => {
    http.get(cacheUrl)
      .then(data => {
        setData(data);
      })
  }, [])

  return (
    <div className={'qrcodeCard'}>
      <QrcodeImage src={'/website/ali/qrcode'}/>
      <Divider>
        <Button onClick={generateData}>扫码后点我</Button>
      </Divider>
      <Row>
        <Col span={11}>
          <p>Token</p>
          <Input.TextArea
            value={data.token}
            onChange={e => setData({token: e.target.value, token280: data.token280})}
            rows={4}
          />
        </Col>
        <Col span={11} offset={2}>
          <p>OpenToken</p>
          <Input.TextArea
            value={data.token280}
            onChange={e => setData({token: data.token, token280: e.target.value})}
            rows={4}
          />
        </Col>
      </Row>
      <div className={'btns'}>
        <Button onClick={storeData} disabled={!data} type={'primary'} size={'large'}>入库</Button>
      </div>
    </div>
  )
}

function SiteDomainSetting({api, name}) {
  const [url, setUrl] = React.useState('');

  const saveUrl = async () => {
    try {
      await http.put(api, {
        url
      })
      message.success('设置成功')
    } catch (e) {
      console.error(e);
      message.error(`设置失败：${e?.message}`)
    }
  }

  useEffect(() => {
    http.get(api)
      .then(data => {
        setUrl(data);
      })
  }, [])

  return (
    <Space.Compact style={{ width: '100%' }}>
      <Input placeholder={`请输入${name}域名`} value={url} onChange={(e) => setUrl(e.target.value)} />
      <Button type="primary" onClick={saveUrl}>保存</Button>
    </Space.Compact>
  )
}

function AccountInfo({api}) {
  const [form] = Form.useForm();
  const submit = async () => {
    try {
      const data = await form.validateFields()
      await http.put(api, data)
      message.success('入库成功')
    } catch (e) {
      console.error(e)
      message.error(`入库失败：${e?.message}`)
    }
  }

  useEffect(() => {
    http.get(api)
      .then(data => {
        form.setFieldsValue(data)
      })
  }, [])

  return (
    <Form form={form}>
      <Form.Item label={"账号"} name="username">
        <Input/>
      </Form.Item>
      <Form.Item label={"密码"} name="password">
        <Input.Password/>
      </Form.Item>
      <Form.Item label={null}>
        <Button type="primary" onClick={submit}>
          保存
        </Button>
      </Form.Item>
    </Form>
  )
}

function TGSou() {
  const [form] = Form.useForm();
  const formItemLayout = {
    labelCol: { span: 6 },
    wrapperCol: { span: 18 },
  };
  const formItemLayoutWithOutLabel = {
    wrapperCol: { span: 18, offset: 6 },
  };

  const submit = async () => {
    const data = await form.validateFields()
    console.log('data', data)
    try {
      await http.put('/tgsou/config', data)
      message.success('入库成功')
    } catch (e) {
      console.error(e)
      message.error(`入库失败：${e?.message}`)
    }
  }

  useEffect(() => {
    http.get('/tgsou/config')
      .then(data => {
        form.setFieldsValue(data)
      })
  }, [])

  return (
    <Form form={form} {...formItemLayout}>
      <Form.Item label={"服务器地址"} name="url">
        <Input/>
      </Form.Item>
      <Form.List
        name="channelUsername"
        rules={[
          {
            required: true,
            message: '请添加频道'
          },
        ]}
      >
        {(fields, { add, remove }, { errors }) => (
          <>
            {fields.map((field, index) => (
              <Form.Item
                label={index === 0 ? '频道列表' : ''}
                required={false}
                key={field.key}
                {...(index === 0 ? formItemLayout : formItemLayoutWithOutLabel)}
                style={{marginBottom: 12}}
              >
                <Form.Item
                  {...field}
                  validateTrigger={['onChange', 'onBlur']}
                  rules={[
                    {
                      required: true,
                      whitespace: true,
                      message: "请输入频道名",
                    },
                  ]}
                  noStyle
                >
                  <Input placeholder="请输入频道名" style={{ width: '60%' }}/>
                </Form.Item>
                {fields.length > 1 ? (
                  <MinusCircleOutlined
                    className="dynamic-delete-button"
                    onClick={() => remove(field.name)}
                  />
                ) : null}
              </Form.Item>
            ))}
            <Form.Item label={''} {...formItemLayoutWithOutLabel}>
              <Button
                type="dashed"
                onClick={() => add()}
                style={{ width: '60%' }}
                icon={<PlusOutlined />}
              >
                添加频道
              </Button>
              <Form.ErrorList errors={errors} />
            </Form.Item>
          </>
        )}
      </Form.List>
      <Form.Item label={"单频道资源数量"} name="count">
        <InputNumber min={1}/>
      </Form.Item>
      <Form.Item label={"显示图片"} name="pic">
        <Switch />
      </Form.Item>
      <Form.Item label={null}>
        <Button type="primary" onClick={submit}>
          保存
        </Button>
      </Form.Item>
    </Form>
  )
}

function App() {
  return (
    <div className={'container'}>
      <Card style={{ height: 600, width: 500 }}>
        <Tabs type="card">
          <TabPane tab="登录信息" key="account">
            <Tabs>
              <TabPane tab="夸克" key="quark">
                <QrcodeCard
                  qrcodeUrl="/website/quark/qrcode"
                  cacheUrl="/quark/cookie"
                />
              </TabPane>
              <TabPane tab="UC Cookie" key="uc-cookie">
                <QrcodeCard
                  qrcodeUrl="/website/uc/qrcode"
                  cacheUrl="/uc/cookie"
                />
              </TabPane>
              <TabPane tab="UC token" key="uc-token">
                <QrcodeCard
                  qrcodeUrl="/website/uc-tv/qrcode"
                  cacheUrl="/uc-tv/token"
                />
              </TabPane>
              <TabPane tab="115" key="115">
                <QrcodeCard
                  qrcodeUrl="/website/115/qrcode"
                  cacheUrl="/115/cookie"
                />
              </TabPane>
              <TabPane tab="阿里" key="ali">
                <AliQrcodeCard />
              </TabPane>
              <TabPane tab="天翼" key="tianyi">
                <AccountInfo api="/tianyi/account"/>
              </TabPane>
              <TabPane tab="123" key="123">
                <AccountInfo api="/pan123/account"/>
              </TabPane>
            </Tabs>
          </TabPane>
          <TabPane tab="站源设置" key="site">
            <Tabs>
              <TabPane tab="木偶域名" key="muou">
                <SiteDomainSetting api={'/muou/url'} name="木偶"/>
              </TabPane>
              <TabPane tab="玩偶域名" key="wogg">
                <SiteDomainSetting api={'/wogg/url'} name="玩偶"/>
              </TabPane>
              <TabPane tab="雷鲸域名" key="leijing">
                <SiteDomainSetting api={'/leijing/url'} name="雷鲸"/>
              </TabPane>
              <TabPane tab="TG搜" key="tgsou">
                <TGSou/>
              </TabPane>
            </Tabs>
          </TabPane>
        </Tabs>
      </Card>
    </div>
  )
}

export function renderClient() {
  const root = createRoot(document.getElementById('app'));
  root.render(<App/>);
}