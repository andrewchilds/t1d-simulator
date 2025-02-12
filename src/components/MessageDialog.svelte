<script>

  import { scale, fade } from 'svelte/transition';
  import { cubicIn, cubicOut } from 'svelte/easing';

  import Button from './Button.svelte';
  import DidYouKnow from './DidYouKnow.svelte';

  export let message;
  export let onClose;

  let scaleProps = {
    duration: 180,
    start: .96,
    opacity: 0
  };

  let scaleInProps = {...scaleProps, easing: cubicOut, delay: 200};
  let scaleOutProps = {...scaleProps, easing: cubicIn};

  function focusOnFirstButton() {
    let firstButton = document.querySelector('.message-dialog button');
    if (firstButton) {
      firstButton.focus();
    }
  }

  $: {
    // Passing in message so this is called whenever message changes.
    // onMount would only be called once since this component is only mounted once.
    setTimeout(() => {
      focusOnFirstButton(message);
    }, 50);
  }

</script>

{#if message}
  <div class="message-overlay" in:fade={{ duration: 150 }} out:fade={{ duration: 150 }}></div>
  <div class="message-parent align-{message.align || 'center'}">
    <div class="message-dialog {message.wide ? 'wide' : ''}" in:scale={scaleInProps} out:scale={scaleOutProps}>
      {#if message.emoji}
        <div class="message-emoji">{message.emoji}</div>
      {/if}
      {#if message.text}
        <div class="message-text">{message.text}</div>
      {/if}
      {#if message.component}
        <svelte:component this={message.component} props={message.componentProps} onClose={message.onClose || onClose} />
      {/if}
      {#if message.note}
        <div class="message-note">{message.note}</div>
      {/if}
      {#if message.didYouKnow}
        <DidYouKnow>{message.didYouKnow}</DidYouKnow>
      {/if}
      {#if message.useDefaultAction !== false}
        <div class="message-actions"><Button className="wide primary" onClick={message.onClose || onClose}>{message.okText || 'OK'}</Button></div>
      {/if}
    </div>
  </div>
{/if}

<style>

  .message-overlay {
    background: var(--message-overlay-bg);
    position: fixed;
    top: 0;
    left: 0;
    width: 100vw;
    height: 100vh;
    z-index: var(--z-modal-dialog-backdrop);
  }

  .message-parent {
    position: absolute;
    z-index: var(--z-modal-dialogs);
    display: grid;
    justify-items: center;
    left: 0;
    width: 100vw;
  }

  .message-parent.align-center {
    align-items: center;
    top: 0;
    height: 100vh;
  }

  .message-parent.align-top {
    align-items: start;
    top: 24px;
  }

  .message-dialog {
    background: var(--dialog-bg-color);
    box-shadow: 0 2px 16px rgba(0, 0, 0, 0.4);
    box-sizing: border-box;
    border-radius: 16px;
    color: var(--text-color);
    padding: 34px 38px;
    position: relative;
    width: 460px;
  }

  .message-dialog.wide {
    width: 580px;
    max-width: calc(100vw - 20px);
  }

  .message-emoji {
    font-size: 64px;
    text-align: center;
    line-height: 100%;
    margin: 0 0 12px;
  }

  .message-text {
    font-size: 18px;
    line-height: 130%;
    font-weight: var(--bold-weight);
    text-align: center;
  }

  .message-note {
    color: var(--text-color);
    font-size: 14px;
    line-height: 140%;
    margin: 8px 0 12px;
  }

  .message-actions {
    margin: 20px 0 0;
    text-align: center;
  }

  @media (max-width: 520px) {
    .message-dialog {
      padding: 24px 28px;
      width: calc(100% - 20px);
    }

    .message-parent.align-top {
      top: 10px;
    }
  }

</style>
