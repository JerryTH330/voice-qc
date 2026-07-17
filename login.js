/**
 * login.js | 交互逻辑与登录校验
 * 默认账号 / 密码：admin / admin
 * 登录成功跳转：./factory-dashboard/index.html
 */

document.addEventListener('DOMContentLoaded', () => {

  // ══════════════════════════════════════
  // 默认账号密码（前端硬编码）
  // ══════════════════════════════════════
  const DEFAULT_ACCOUNT = 'admin';
  const DEFAULT_PASSWORD = 'admin';

  // ══════════════════════════════════════
  // 1. 高阶 3D 倾斜交互 (Tilt Effect) - Left Panel
  // ══════════════════════════════════════
  const brandPanel = document.querySelector('.brand-panel');
  const tiltNodes = document.querySelectorAll('[data-tilt]');

  if (brandPanel && window.innerWidth > 1024) {
    brandPanel.addEventListener('mousemove', (e) => {
      // 节流处理渲染
      requestAnimationFrame(() => {
        const rect = brandPanel.getBoundingClientRect();
        // 计算鼠标相对面板中心的 X Y 百分比映射到 [-1, 1]
        const x = (e.clientX - rect.left - rect.width / 2) / (rect.width / 2);
        const y = (e.clientY - rect.top - rect.height / 2) / (rect.height / 2);

        tiltNodes.forEach(node => {
          // 增益系数：值越大，倾斜越明显
          const tiltX = -y * 8;
          const tiltY = x * 8;
          node.style.transform = `perspective(1000px) rotateX(${tiltX}deg) rotateY(${tiltY}deg) scale3d(1.02, 1.02, 1.02)`;
        });
      });
    });

    brandPanel.addEventListener('mouseleave', () => {
      tiltNodes.forEach(node => {
        // 恢复原状
        node.style.transform = `perspective(1000px) rotateX(0deg) rotateY(0deg) scale3d(1, 1, 1)`;
      });
    });
  }

  // ══════════════════════════════════════
  // 2. 表单验证与动效 - Right Panel
  // ══════════════════════════════════════
  const form = document.getElementById('login-form');
  const btn = document.getElementById('login-btn');
  const pwdToggle = document.getElementById('pwd-toggle');
  const pwdInput = document.getElementById('password');
  const eyeOpen = document.querySelector('.icon-eye');
  const eyeOff = document.querySelector('.icon-eye-off');

  // 密码显示 / 隐藏开关
  if (pwdToggle) {
    pwdToggle.addEventListener('click', () => {
      if (pwdInput.type === 'password') {
        pwdInput.type = 'text';
        eyeOpen.style.display = 'none';
        eyeOff.style.display = 'block';
      } else {
        pwdInput.type = 'password';
        eyeOpen.style.display = 'block';
        eyeOff.style.display = 'none';
      }
    });
  }

  // 表单聚焦/失焦清理错误状态
  const inputs = document.querySelectorAll('.input-box input');
  inputs.forEach(input => {
    input.addEventListener('input', () => {
      const box = input.closest('.input-box');
      if (box.classList.contains('has-error')) {
        box.classList.remove('has-error');
      }
    });
  });

  // 触发错误状态与抖动动效
  function showFieldError(box) {
    box.classList.add('has-error');
    box.classList.remove('shake-anim');
    void box.offsetWidth; // trigger reflow
    box.classList.add('shake-anim');
  }

  // 模拟登录提交验证
  if (form) {
    form.addEventListener('submit', (e) => {
      e.preventDefault();

      const tenantEl = document.getElementById('tenant');
      const accountEl = document.getElementById('account');
      const passwordEl = document.getElementById('password');

      const tenantVal = tenantEl.value.trim();
      const accountVal = accountEl.value.trim();
      const passwordVal = passwordEl.value;

      let hasError = false;

      // 1) 必填校验：租户、账号、密码不能为空
      if (!tenantVal) {
        showFieldError(tenantEl.closest('.input-box'));
        hasError = true;
      }
      if (!accountVal) {
        showFieldError(accountEl.closest('.input-box'));
        hasError = true;
      }
      if (!passwordVal) {
        showFieldError(passwordEl.closest('.input-box'));
        hasError = true;
      }

      if (hasError) return;

      // 2) 默认账号密码校验：admin / admin
      const accountOk = accountVal === DEFAULT_ACCOUNT;
      const passwordOk = passwordVal === DEFAULT_PASSWORD;

      if (!accountOk) {
        showFieldError(accountEl.closest('.input-box'));
      }
      if (!passwordOk) {
        showFieldError(passwordEl.closest('.input-box'));
      }

      if (!accountOk || !passwordOk) return;

      // 3) 通过验证，进入 Loading 态
      btn.classList.add('loading');

      // 模拟 API 请求网络延迟
      setTimeout(() => {
        btn.classList.remove('loading');
        // 成功跳转并带上简单效果
        document.body.style.opacity = '0';
        document.body.style.transition = 'opacity 0.4s';
        setTimeout(() => {
          window.location.href = './factory-dashboard/index.html';
        }, 400);
      }, 1200);
    });
  }
});
