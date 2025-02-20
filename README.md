إذا كنت تريد أن يكون الـ `secret_key` فريدًا لكل مستخدم بدلاً من أن يكون ثابتًا على مستوى التطبيق بالكامل، فيمكنك توليد مفتاح سري مخصص لكل مستخدم. هناك عدة طرق لتحقيق ذلك، ولكن يجب أن تأخذ في اعتبارك بعض الأمور مثل كيفية إدارة وحفظ هذه المفاتيح بطريقة آمنة.

### السيناريوهات المحتملة

1. **توليد `secret_key` ديناميكي لكل مستخدم عند تسجيل الدخول أو عند إنشاء الحساب**.
2. **استخدام بيانات خاصة بالمستخدم (مثل ID المستخدم أو البريد الإلكتروني) كجزء من المفتاح السري**.

### الحلول:

#### 1. **استخدام بيانات المستخدم لتوليد `secret_key` ديناميكي:**

يمكنك توليد `secret_key` يعتمد على بيانات المستخدم، مثل الـ `user_id` أو البريد الإلكتروني، ثم استخدام هذه البيانات كجزء من المفتاح السري.

##### **مثال: استخدام `user_id` كجزء من المفتاح السري:**

```javascript
const jwt = require('jsonwebtoken');

// دالة لتوليد مفتاح سري ديناميكي لكل مستخدم
const generateSecretKeyForUser = (user) => {
  const baseSecret = process.env.BASE_SECRET_KEY; // مفتاح أساسي ثابت
  return `${baseSecret}-${user.id}`; // توليد مفتاح فريد باستخدام ID المستخدم
};

// دالة المصادقة
const authToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Access Denied');
  }

  // الحصول على المستخدم من قاعدة البيانات أو من التوكن
  const user = req.user; // افترض أن لديك `user` في الطلب

  // توليد الـ secret_key المخصص للمستخدم
  const userSecretKey = generateSecretKeyForUser(user);

  jwt.verify(token, userSecretKey, (err, userData) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = userData;
    next();
  });
};

module.exports = authToken;
```

### 2. **توليد `secret_key` عند إنشاء المستخدم أو تسجيل الدخول:**

يمكنك إنشاء مفتاح سري جديد لكل مستخدم عند تسجيل الدخول أو عند إنشاء الحساب، وتخزينه في قاعدة البيانات بحيث يتم استخدامه للتحقق من التوكنات الخاصة بهذا المستخدم لاحقًا.

#### **خطوات الحل:**

1. **توليد مفتاح عند تسجيل المستخدم:**

عند تسجيل المستخدم أو تسجيل دخوله لأول مرة، يمكنك توليد `secret_key` وحفظه في قاعدة البيانات المرتبطة بالمستخدم.

```javascript
const crypto = require('crypto');

// دالة لتوليد مفتاح سري عشوائي
const generateSecretKey = () => {
  return crypto.randomBytes(64).toString('hex');
};

// مثال عند إنشاء مستخدم جديد
const createUser = (userData) => {
  const secretKey = generateSecretKey();
  // احفظ المفتاح السري الخاص بالمستخدم في قاعدة البيانات
  userData.secretKey = secretKey;
  // حفظ بيانات المستخدم في قاعدة البيانات
};
```

2. **استخدام المفتاح السري عند تسجيل الدخول:**

عند تسجيل دخول المستخدم، يمكنك استخراج المفتاح السري الخاص به من قاعدة البيانات واستخدامه لتوليد JWT.

```javascript
const jwt = require('jsonwebtoken');

const loginUser = (req, res) => {
  const { username, password } = req.body;
  
  // تحقق من بيانات المستخدم وتأكد من أن البيانات صحيحة
  const user = getUserFromDatabase(username);

  if (!user) {
    return res.status(401).send('Invalid credentials');
  }

  // استخراج المفتاح السري الخاص بالمستخدم من قاعدة البيانات
  const secretKey = user.secretKey;

  // إنشاء توكن JWT باستخدام المفتاح السري الخاص بالمستخدم
  const token = jwt.sign({ id: user.id }, secretKey, { expiresIn: '1h' });

  // إرسال التوكن إلى العميل
  res.cookie('token', token);
  res.send('Logged in successfully');
};
```

3. **التحقق من التوكن باستخدام المفتاح السري المخزن:**

عندما يحتاج المستخدم للوصول إلى موارد محمية، يمكنك استرجاع المفتاح السري من قاعدة البيانات والتحقق من التوكن.

```javascript
const authToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).send('Access Denied');
  }

  // استخراج المستخدم من قاعدة البيانات
  const user = getUserFromDatabaseByToken(token);

  if (!user) {
    return res.status(403).send('Invalid token');
  }

  // الحصول على المفتاح السري الخاص بالمستخدم
  const userSecretKey = user.secretKey;

  jwt.verify(token, userSecretKey, (err, userData) => {
    if (err) return res.status(403).send('Invalid token');
    req.user = userData;
    next();
  });
};
```

### 3. **اعتبارات الأمان:**
- **تخزين المفتاح السري للمستخدم**: تأكد من أن المفاتيح السرية مخزنة بأمان في قاعدة البيانات.
- **إدارة صلاحية التوكنات**: يمكنك تحديد مدة صلاحية للتوكنات (`expiresIn`) للتأكد من أنها لا تظل صالحة إلى الأبد.
- **التشفير والنسخ الاحتياطي**: قم بتشفير البيانات الحساسة في قاعدة البيانات وتأمين النسخ الاحتياطية لضمان عدم الوصول إلى المفاتيح السرية في حال حدوث تسرب بيانات.

### الخلاصة:
- يمكنك توليد `secret_key` ديناميكي باستخدام بيانات فريدة لكل مستخدم مثل `user_id`.
- أو يمكنك توليد `secret_key` فريد لكل مستخدم عند إنشاء الحساب أو تسجيل الدخول، وحفظه في قاعدة البيانات لاستخدامه لاحقًا في التحقق من التوكنات.
- من الضروري التأكد من إدارة المفاتيح السرية بأمان لمنع أي هجمات على تطبيقك.


# package.json
to make auto => it wil ask you about your project
``` npm init ``` => add -y to accept the defaults

npm init: Creates package.json interactively.
npm init -y: Creates it with default values.
Install dependencies using npm install [package-name] which also updates package.json.
عند بناء تطبيق يستخدم **Node.js** و **Express** و **PostgreSQL** مع **React**، من المهم تنظيم ملفات المشروع بطريقة تسهل صيانته وتطويره مستقبلاً. لتحديد مكان ملفات التعامل مع قاعدة البيانات، يُفضل اتباع **مبدأ الفصل بين المسؤوليات (Separation of Concerns)**. هذا يعني أنك تفصل منطق التعامل مع قاعدة البيانات عن منطق الخادم (Server) والواجهات (Routes) وأيضًا عن واجهة المستخدم (Frontend).

### هيكلية المشروع المقترحة

إليك هيكلية مشروع مقترحة تساعدك في تنظيم ملفاتك بشكل فعّال:

```
myproject/
├── client/                 # تطبيق React
├── server/                 # الخادم الخلفي (Backend)
│   ├── config/             # إعدادات الاتصال بقاعدة البيانات
│   │   └── db.js
│   ├── controllers/        # منطق التحكم في البيانات (Controllers)
│   │   └── dataController.js
│   ├── models/             # نماذج البيانات (Models)
│   │   └── dataModel.js
│   ├── routes/             # تعريف المسارات (Routes)
│   │   └── dataRoutes.js
│   ├── .env
│   └── index.js            # نقطة الدخول للخادم
├── package.json
└── README.md
```

### شرح المجلدات والملفات

1. **client/**: يحتوي على تطبيق **React** الخاص بك.
2. **server/**: يحتوي على كل ما يتعلق بالخادم الخلفي.
   - **config/db.js**: إعدادات الاتصال بقاعدة البيانات.
   - **models/**: ملفات تعريف النماذج التي تتعامل مع قاعدة البيانات.
   - **controllers/**: منطق التحكم في البيانات، يتعامل مع طلبات المستخدمين ويتفاعل مع النماذج.
   - **routes/**: تعريف المسارات (Endpoints) التي يستجيب لها الخادم.
   - **index.js**: نقطة الدخول للخادم، حيث يتم إعداد الخادم وتشغيله.

### الخطوات التفصيلية

#### 1. إنشاء المجلدات والملفات

داخل مجلد `server/`، قم بإنشاء المجلدات والملفات التالية:

- **config/db.js**: لإعداد الاتصال بقاعدة البيانات.
- **models/dataModel.js**: لتعريف وظائف التعامل مع قاعدة البيانات.
- **controllers/dataController.js**: لمعالجة الطلبات وتنفيذ منطق الأعمال.
- **routes/dataRoutes.js**: لتعريف المسارات الخاصة بالبيانات.
- **index.js**: إعداد الخادم وتشغيله.

#### 2. إعداد الاتصال بقاعدة البيانات (`config/db.js`)

```javascript
// server/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  port: process.env.DB_PORT,
});

pool.on('connect', () => {
  console.log('Connected to PostgreSQL');
});

module.exports = pool;
```

#### 3. إنشاء نموذج البيانات (`models/dataModel.js`)

```javascript
// server/models/dataModel.js
const pool = require('../config/db');

// دالة للحصول على جميع البيانات
const getAllData = async () => {
  const result = await pool.query('SELECT * FROM your_table');
  return result.rows;
};

// دالة لإضافة بيانات جديدة
const addData = async (name, description) => {
  const result = await pool.query(
    'INSERT INTO your_table (name, description) VALUES ($1, $2) RETURNING *',
    [name, description]
  );
  return result.rows[0];
};

// دالة لتحديث بيانات موجودة
const updateData = async (id, name, description) => {
  const result = await pool.query(
    'UPDATE your_table SET name = $1, description = $2 WHERE id = $3 RETURNING *',
    [name, description, id]
  );
  return result.rows[0];
};

// دالة لحذف بيانات
const deleteData = async (id) => {
  await pool.query('DELETE FROM your_table WHERE id = $1', [id]);
};

module.exports = {
  getAllData,
  addData,
  updateData,
  deleteData,
};
```

#### 4. إنشاء وحدة التحكم (Controller) (`controllers/dataController.js`)

```javascript
// server/controllers/dataController.js
const Data = require('../models/dataModel');

// الحصول على جميع البيانات
const getData = async (req, res) => {
  try {
    const data = await Data.getAllData();
    res.json(data);
  } catch (error) {
    console.error('Error fetching data:', error.message);
    res.status(500).send('Server Error');
  }
};

// إضافة بيانات جديدة
const createData = async (req, res) => {
  const { name, description } = req.body;
  try {
    const newData = await Data.addData(name, description);
    res.status(201).json(newData);
  } catch (error) {
    console.error('Error adding data:', error.message);
    res.status(500).send('Server Error');
  }
};

// تحديث بيانات موجودة
const updateExistingData = async (req, res) => {
  const { id } = req.params;
  const { name, description } = req.body;
  try {
    const updatedData = await Data.updateData(id, name, description);
    res.json(updatedData);
  } catch (error) {
    console.error('Error updating data:', error.message);
    res.status(500).send('Server Error');
  }
};

// حذف بيانات
const deleteExistingData = async (req, res) => {
  const { id } = req.params;
  try {
    await Data.deleteData(id);
    res.status(204).send();
  } catch (error) {
    console.error('Error deleting data:', error.message);
    res.status(500).send('Server Error');
  }
};

module.exports = {
  getData,
  createData,
  updateExistingData,
  deleteExistingData,
};
```

#### 5. تعريف المسارات (Routes) (`routes/dataRoutes.js`)

```javascript
// server/routes/dataRoutes.js
const express = require('express');
const router = express.Router();
const dataController = require('../controllers/dataController');

// مسار للحصول على جميع البيانات
router.get('/', dataController.getData);

// مسار لإضافة بيانات جديدة
router.post('/', dataController.createData);

// مسار لتحديث بيانات موجودة
router.put('/:id', dataController.updateExistingData);

// مسار لحذف بيانات
router.delete('/:id', dataController.deleteExistingData);

module.exports = router;
```

#### 6. إعداد الخادم وتشغيله (`index.js`)

```javascript
// server/index.js
const express = require('express');
const cors = require('cors');
require('dotenv').config();

const app = express();
const port = process.env.PORT || 5000;

// إعدادات Middleware
app.use(cors());
app.use(express.json());

// تعريف المسارات
const dataRoutes = require('./routes/dataRoutes');
app.use('/api/data', dataRoutes);

// اختبار الاتصال بقاعدة البيانات يتم في ملف config/db.js عند الاتصال

// بدء الخادم
app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});
```

#### 7. تحديث ملف `.env`

تأكد من أن ملف `.env` موجود داخل مجلد `server/` ويحتوي على متغيرات البيئة المطلوبة:

```
DB_HOST=localhost
DB_USER=myuser
DB_PASSWORD=mypassword
DB_NAME=myprojectdb
DB_PORT=5432
PORT=5000
```

### لماذا تفصل بين الملفات بهذه الطريقة؟

1. **القابلية للصيانة**: عندما يكون لديك فصل واضح بين المكونات المختلفة، يصبح من السهل تعديل أو إصلاح جزء معين دون التأثير على الأجزاء الأخرى.
2. **إعادة الاستخدام**: يمكنك إعادة استخدام النماذج (Models) أو وحدات التحكم (Controllers) في مسارات أخرى بسهولة.
3. **القابلية للتوسع**: مع نمو المشروع، يمكنك إضافة ميزات جديدة دون الحاجة إلى إعادة تنظيم الكثير من الأكواد.
4. **سهولة الفهم**: يساعد هذا التنظيم المطورين الآخرين (أو حتى أنت في المستقبل) على فهم هيكلية المشروع بسرعة وسهولة.

### نصائح إضافية

- **استخدام ORM أو مكتبات أخرى**: مثل **Sequelize** أو **TypeORM** إذا كنت تفضل العمل مع ORM بدلاً من كتابة استعلامات SQL يدوية.
  
  ```bash
  npm install sequelize
  npm install pg pg-hstore
  ```

- **إضافة إدارة للأخطاء**: يمكنك إنشاء Middleware مخصص لإدارة الأخطاء وتحسين استجابة الخادم عند حدوث أخطاء.
  
  ```javascript
  // server/middleware/errorHandler.js
  const errorHandler = (err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ message: 'Internal Server Error' });
  };

  module.exports = errorHandler;
  ```

  ثم استخدامه في `index.js`:

  ```javascript
  const errorHandler = require('./middleware/errorHandler');
  app.use(errorHandler);
  ```

- **التحقق من صحة البيانات**: قبل إدخال البيانات إلى قاعدة البيانات، تحقق من صحتها باستخدام مكتبات مثل **Joi** أو **express-validator**.
  
  ```bash
  npm install express-validator
  ```

- **الاختبارات**: أضف اختبارات للوحدات (Unit Tests) لضمان أن كل جزء من تطبيقك يعمل بشكل صحيح.

### مثال متكامل للتفاعل مع قاعدة البيانات

#### إضافة عملية إنشاء بيانات جديدة من React

في واجهة **React**، يمكنك إضافة نموذج لإدخال بيانات جديدة وإرسالها إلى الخادم الخلفي:

```javascript
// client/src/App.js
import React, { useEffect, useState } from 'react';

function App() {
  const [data, setData] = useState([]);
  const [form, setForm] = useState({ name: '', description: '' });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = () => {
    fetch('http://localhost:5000/api/data')
      .then(response => response.json())
      .then(data => setData(data))
      .catch(error => console.error('Error fetching data:', error));
  };

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    fetch('http://localhost:5000/api/data', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(form),
    })
      .then(response => response.json())
      .then(newData => {
        setData([...data, newData]);
        setForm({ name: '', description: '' });
      })
      .catch(error => console.error('Error adding data:', error));
  };

  return (
    <div>
      <h1>البيانات من PostgreSQL</h1>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          value={form.name}
          onChange={handleChange}
          placeholder="الاسم"
          required
        />
        <textarea
          name="description"
          value={form.description}
          onChange={handleChange}
          placeholder="الوصف"
          required
        ></textarea>
        <button type="submit">إضافة</button>
      </form>
      <ul>
        {data.map(item => (
          <li key={item.id}>
            <strong>{item.name}</strong>: {item.description}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default App;
```

### الخلاصة

من الأفضل تنظيم مشروعك بحيث تكون ملفات التعامل مع قاعدة البيانات موجودة في مجلد **models** أو **data access layer**، وفصل منطق الخادم (Routes) ووحدات التحكم (Controllers) بشكل منفصل عن هذه النماذج. هذا التنظيم يسهل صيانة وتطوير المشروع على المدى الطويل، ويجعل الكود أكثر وضوحاً وقابلية لإعادة الاستخدام.

إذا كان لديك أي أسئلة إضافية أو تحتاج إلى مزيد من التوضيح حول أي جزء من العملية، لا تتردد في طرحها!
// تحميل مكتبة dotenv مع تحديد المسار إلى ملف .env داخل مجلد config
require('dotenv').config({ path: './config/.env' });

const express = require('express');
const jwt = require('jsonwebtoken');

const app = express();

// تحقق مما إذا كان المتغير محملاً بشكل صحيح
console.log('JWT_SECRET:', process.env.JWT_SECRET);

app.post('/login', (req, res) => {
  const user = req.body.user;
  if (!user) {
    return res.status(400).json({ error: 'User not provided' });
  }

  // استخدم المتغير الذي تم تحميله من ملف .env
  const token = jwt.sign({ id: user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });

  res.json({ token });
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});
