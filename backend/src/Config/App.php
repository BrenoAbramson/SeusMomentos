<?php

namespace Src\Config;

use Dotenv\Dotenv;

class App
{
    public static function loadEnv()
    {
        $dotenv = Dotenv::createImmutable(__DIR__ . '/../../');
        $dotenv->load();
    }
}
